using System.Text.Json;
using GeoObjectMapper.Api.Controllers;
using GeoObjectMapper.Api.Middlewares;
using GeoObjectMapper.Application;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Application.Features.GeoObjects.Commands;
using GeoObjectMapper.Application.Features.GeoObjects.Queries;
using GeoObjectMapper.Application.Features.Polygons.Commands;
using GeoObjectMapper.Application.Features.Polygons.Queries;
using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.Exceptions;
using GeoObjectMapper.Domain.Repositories;
using GeoObjectMapper.Domain.ValueObjects;
using GeoObjectMapper.Infrastructure.Persistence.Context;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;

namespace GeoObjectMapper.UnitTests;

public class ApplicationAndApiTests
{
    private static PolygonGeometryDto SampleTriangleDto() => new(
        "Polygon",
        [
            [
                [34.78, 32.08],
                [34.80, 32.08],
                [34.80, 32.10],
                [34.78, 32.08]
            ]
        ]);

    private static PointGeometryDto SamplePointDto() => new("Point", [34.7818, 32.0853]);

    private static ServiceProvider BuildMediatRPipeline(
        InMemoryPolygonStore? polygonStore = null,
        InMemoryGeoObjectStore? objectStore = null)
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddApplication();
        services.AddSingleton<IPolygonRepository>(polygonStore ?? new InMemoryPolygonStore());
        services.AddSingleton<IGeoObjectRepository>(objectStore ?? new InMemoryGeoObjectStore());
        return services.BuildServiceProvider();
    }

    [Fact]
    public async Task Polygon_CQRS_lifecycle_create_batch_query_delete_works_end_to_end()
    {
        using var provider = BuildMediatRPipeline();
        var sender = provider.GetRequiredService<ISender>();

        var created = await sender.Send(new CreatePolygonCommand("Sector Alpha", "#2563EB", SampleTriangleDto()));
        Assert.True(created.IsSuccess);
        Assert.Equal("Sector Alpha", created.Value.Name);
        Assert.Equal([34.78, 32.08], created.Value.Geometry.Coordinates[0][0]);

        var batch = await sender.Send(new CreatePolygonsBatchCommand(
        [
            new CreatePolygonDto("Sector Beta", "#16A34A", SampleTriangleDto()),
            new CreatePolygonDto("Sector Gamma", null, SampleTriangleDto())
        ]));
        Assert.True(batch.IsSuccess);
        Assert.Equal(2, batch.Value.Count);

        var all = await sender.Send(new GetAllPolygonsQuery());
        Assert.Equal(3, all.Value.Count);

        var createdId = Guid.Parse(created.Value.Id);
        var fetched = await sender.Send(new GetPolygonByIdQuery(createdId));
        Assert.True(fetched.IsSuccess);
        Assert.Equal("Sector Alpha", fetched.Value.Name);

        var deletedOne = await sender.Send(new DeletePolygonCommand(createdId));
        Assert.True(deletedOne.IsSuccess);

        var missing = await sender.Send(new GetPolygonByIdQuery(createdId));
        Assert.True(missing.IsFailure);
        Assert.Equal("Polygon.NotFound", missing.Error.Code);

        var deletedAll = await sender.Send(new DeleteAllPolygonsCommand());
        Assert.True(deletedAll.IsSuccess);
        Assert.Empty((await sender.Send(new GetAllPolygonsQuery())).Value);
    }

    [Fact]
    public async Task GeoObject_CQRS_lifecycle_create_batch_update_conflict_and_delete_works()
    {
        var store = new InMemoryGeoObjectStore();
        using var provider = BuildMediatRPipeline(objectStore: store);
        var sender = provider.GetRequiredService<ISender>();

        var created = await sender.Send(new CreateGeoObjectCommand("Jeep 1", "jeep", SamplePointDto()));
        Assert.True(created.IsSuccess);
        Assert.Equal("jeep", created.Value.SymbolType);
        Assert.Equal([34.7818, 32.0853], created.Value.Geometry.Coordinates);

        var batch = await sender.Send(new CreateGeoObjectsBatchCommand(
        [
            new CreateGeoObjectDto("Marker 1", "marker", SamplePointDto()),
            new CreateGeoObjectDto("Drone 1", "drone", SamplePointDto())
        ]));
        Assert.True(batch.IsSuccess);
        Assert.Equal(2, batch.Value.Count);

        var objectId = Guid.Parse(created.Value.Id);
        var updated = await sender.Send(new UpdateGeoObjectCommand(
            objectId,
            "Command Jeep",
            "radar",
            new PointGeometryDto("Point", [34.79, 32.09]),
            created.Value.Timestamp));
        Assert.True(updated.IsSuccess);
        Assert.Equal("Command Jeep", updated.Value.Name);
        Assert.Equal("radar", updated.Value.SymbolType);

        var staleUpdate = await sender.Send(new UpdateGeoObjectCommand(
            objectId,
            "Stale Write",
            null,
            null,
            created.Value.Timestamp));
        Assert.True(staleUpdate.IsFailure);
        Assert.Equal("Conflict.VersionMismatch", staleUpdate.Error.Code);

        await sender.Send(new DeleteGeoObjectCommand(objectId));
        Assert.Equal(2, (await sender.Send(new GetAllGeoObjectsQuery())).Value.Count);

        await sender.Send(new DeleteAllGeoObjectsCommand());
        Assert.Empty((await sender.Send(new GetAllGeoObjectsQuery())).Value);
    }

    [Fact]
    public async Task ValidationBehavior_returns_structured_field_errors_without_throwing()
    {
        using var provider = BuildMediatRPipeline();
        var sender = provider.GetRequiredService<ISender>();

        var invalid = new CreateGeoObjectCommand(
            "",
            "spaceship",
            new PointGeometryDto("Point", [999, 999]));

        var result = await sender.Send(invalid);

        Assert.True(result.IsFailure);
        Assert.Equal("Validation.General", result.Error.Code);
        Assert.NotNull(result.Error.ValidationErrors);
        Assert.Contains("Name", result.Error.ValidationErrors!.Keys);
        Assert.Contains("SymbolType", result.Error.ValidationErrors!.Keys);
    }

    [Fact]
    public async Task Controllers_return_201_CreatedAtAction_204_NoContent_and_400_ValidationProblemDetails()
    {
        using var provider = BuildMediatRPipeline();
        var sender = provider.GetRequiredService<ISender>();

        var objectsController = new ObjectsController(sender)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        var createAction = await objectsController.Create(new CreateGeoObjectDto("Jeep 1", "jeep", SamplePointDto()));
        var createdResult = Assert.IsType<CreatedAtActionResult>(createAction);
        Assert.Equal(StatusCodes.Status201Created, createdResult.StatusCode);
        Assert.Equal(nameof(ObjectsController.GetById), createdResult.ActionName);
        var createdId = Guid.Parse(Assert.IsType<string>(createdResult.RouteValues!["id"]));

        var deleteAction = await objectsController.Delete(createdId);
        Assert.IsType<NoContentResult>(deleteAction);

        var badAction = await objectsController.Create(new CreateGeoObjectDto("", "invalid", SamplePointDto()));
        var badRequest = Assert.IsType<BadRequestObjectResult>(badAction);
        var problem = Assert.IsType<ValidationProblemDetails>(badRequest.Value);
        Assert.Contains("Name", problem.Errors.Keys);
        Assert.Contains("SymbolType", problem.Errors.Keys);
    }

    [Fact]
    public async Task GlobalExceptionHandlerMiddleware_maps_domain_and_timeout_exceptions_to_problem_details()
    {
        var loggerFactory = LoggerFactory.Create(_ => { });
        var logger = loggerFactory.CreateLogger<GlobalExceptionHandlerMiddleware>();

        var domainContext = new DefaultHttpContext();
        domainContext.Response.Body = new MemoryStream();
        var domainMiddleware = new GlobalExceptionHandlerMiddleware(
            _ => throw new InvalidEntityNameException("Polygon name cannot be empty."),
            logger);

        await domainMiddleware.InvokeAsync(domainContext);
        Assert.Equal(StatusCodes.Status400BadRequest, domainContext.Response.StatusCode);

        domainContext.Response.Body.Position = 0;
        using var doc = await JsonDocument.ParseAsync(domainContext.Response.Body);
        Assert.Equal("Polygon name cannot be empty.", doc.RootElement.GetProperty("detail").GetString());

        var timeoutContext = new DefaultHttpContext();
        timeoutContext.Response.Body = new MemoryStream();
        var timeoutMiddleware = new GlobalExceptionHandlerMiddleware(
            _ => throw new TimeoutException("Mongo timed out"),
            logger);

        await timeoutMiddleware.InvokeAsync(timeoutContext);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, timeoutContext.Response.StatusCode);
    }

    [Fact]
    public void Bson_documents_serialize_all_fields_in_consistent_camelCase_GeoJSON_format()
    {
        var doc = new GeoObjectDocument
        {
            Id = Guid.NewGuid(),
            Name = "Jeep 1",
            SymbolType = "jeep",
            Geometry = new GeoJsonPointDocument
            {
                Type = "Point",
                Coordinates = [34.7818, 32.0853]
            },
            Timestamp = DateTime.UtcNow
        };

        var bson = doc.ToBsonDocument();

        Assert.True(bson.Contains("name"));
        Assert.True(bson.Contains("symbolType"));
        Assert.True(bson.Contains("geometry"));
        Assert.True(bson.Contains("timestamp"));
        Assert.False(bson.Contains("Name"));
        Assert.False(bson.Contains("SymbolType"));
        Assert.Equal("Point", bson["geometry"]["type"].AsString);
        Assert.Equal(34.7818, bson["geometry"]["coordinates"][0].AsDouble);
        Assert.Equal(32.0853, bson["geometry"]["coordinates"][1].AsDouble);
    }

    private sealed class InMemoryPolygonStore : IPolygonRepository
    {
        private readonly Dictionary<Guid, Polygon> _items = new();

        public Task<Polygon?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            Task.FromResult(_items.TryGetValue(id, out var p) ? Clone(p) : null);

        public Task<IReadOnlyList<Polygon>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Polygon>>(_items.Values.Select(Clone).ToList());

        public Task AddAsync(Polygon entity, CancellationToken cancellationToken = default)
        {
            _items[entity.Id] = Clone(entity);
            return Task.CompletedTask;
        }

        public Task AddRangeAsync(IEnumerable<Polygon> entities, CancellationToken cancellationToken = default)
        {
            foreach (var entity in entities) _items[entity.Id] = Clone(entity);
            return Task.CompletedTask;
        }

        public Task<bool> UpdateAsync(Polygon entity, DateTime expectedTimestamp, CancellationToken cancellationToken = default)
        {
            if (!_items.TryGetValue(entity.Id, out var stored) || stored.Timestamp != expectedTimestamp)
            {
                return Task.FromResult(false);
            }
            _items[entity.Id] = Clone(entity);
            return Task.FromResult(true);
        }

        public Task DeleteAsync(Polygon entity, CancellationToken cancellationToken = default)
        {
            _items.Remove(entity.Id);
            return Task.CompletedTask;
        }

        public Task DeleteAllAsync(CancellationToken cancellationToken = default)
        {
            _items.Clear();
            return Task.CompletedTask;
        }

        private static Polygon Clone(Polygon src)
        {
            var copy = Polygon.Create(src.Name, src.Color, src.Geometry, src.Id);
            copy.SetTimestamp(src.Timestamp);
            return copy;
        }
    }

    private sealed class InMemoryGeoObjectStore : IGeoObjectRepository
    {
        private readonly Dictionary<Guid, GeoObject> _items = new();

        public Task<GeoObject?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            Task.FromResult(_items.TryGetValue(id, out var o) ? Clone(o) : null);

        public Task<IReadOnlyList<GeoObject>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<GeoObject>>(_items.Values.Select(Clone).ToList());

        public Task AddAsync(GeoObject entity, CancellationToken cancellationToken = default)
        {
            _items[entity.Id] = Clone(entity);
            return Task.CompletedTask;
        }

        public Task AddRangeAsync(IEnumerable<GeoObject> entities, CancellationToken cancellationToken = default)
        {
            foreach (var entity in entities) _items[entity.Id] = Clone(entity);
            return Task.CompletedTask;
        }

        public Task<bool> UpdateAsync(GeoObject entity, DateTime expectedTimestamp, CancellationToken cancellationToken = default)
        {
            if (!_items.TryGetValue(entity.Id, out var stored) || stored.Timestamp != expectedTimestamp)
            {
                return Task.FromResult(false);
            }
            _items[entity.Id] = Clone(entity);
            return Task.FromResult(true);
        }

        public Task DeleteAsync(GeoObject entity, CancellationToken cancellationToken = default)
        {
            _items.Remove(entity.Id);
            return Task.CompletedTask;
        }

        public Task DeleteAllAsync(CancellationToken cancellationToken = default)
        {
            _items.Clear();
            return Task.CompletedTask;
        }

        private static GeoObject Clone(GeoObject src)
        {
            var copy = GeoObject.Create(src.Name, src.SymbolType, src.Geometry, src.Id);
            copy.SetTimestamp(src.Timestamp);
            return copy;
        }
    }
}
