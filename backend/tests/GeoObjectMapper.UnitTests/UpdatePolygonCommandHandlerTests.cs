using GeoObjectMapper.Application.Features.Polygons.Commands;
using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.Repositories;
using GeoObjectMapper.Domain.ValueObjects;

namespace GeoObjectMapper.UnitTests;

public class UpdatePolygonCommandHandlerTests
{
    private readonly Polygon _polygon = Polygon.Create("Original", null, PolygonGeometry.FromRing(
    [
        new Coordinate(0, 0),
        new Coordinate(0, 1),
        new Coordinate(1, 1),
        new Coordinate(0, 0)
    ]));

    private string CurrentTimestamp => _polygon.Timestamp.ToString("o");

    private static Task<Application.Common.Models.Result<Application.DTOs.PolygonDto>> Rename(
        FakePolygonRepository repository,
        Guid id,
        string timestamp) =>
        new UpdatePolygonCommandHandler(repository).Handle(
            new UpdatePolygonCommand(id, "Renamed", null, null, timestamp),
            CancellationToken.None);

    [Fact]
    public async Task Updates_when_the_timestamp_matches()
    {
        var result = await Rename(new FakePolygonRepository(_polygon), _polygon.Id, CurrentTimestamp);

        Assert.True(result.IsSuccess);
        Assert.Equal("Renamed", result.Value.Name);
    }

    [Fact]
    public async Task Returns_conflict_when_the_timestamp_is_stale()
    {
        var repository = new FakePolygonRepository(_polygon);

        var result = await Rename(repository, _polygon.Id, "2000-01-01T00:00:00.0000000Z");

        Assert.Equal("Conflict.VersionMismatch", result.Error.Code);
        Assert.False(repository.WasUpdated);
    }

    [Fact]
    public async Task Returns_conflict_when_another_write_wins_the_race()
    {
        var repository = new FakePolygonRepository(_polygon) { LosesRace = true };

        var result = await Rename(repository, _polygon.Id, CurrentTimestamp);

        Assert.Equal("Conflict.VersionMismatch", result.Error.Code);
    }

    [Fact]
    public async Task Returns_not_found_for_a_missing_polygon()
    {
        var result = await Rename(new FakePolygonRepository(_polygon), Guid.NewGuid(), CurrentTimestamp);

        Assert.EndsWith(".NotFound", result.Error.Code);
    }

    private sealed class FakePolygonRepository(Polygon polygon) : IPolygonRepository
    {
        public bool LosesRace { get; init; }
        public bool WasUpdated { get; private set; }

        public Task<Polygon?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            Task.FromResult(id == polygon.Id ? polygon : null);

        public Task<bool> UpdateAsync(Polygon entity, DateTime expectedTimestamp, CancellationToken cancellationToken = default)
        {
            WasUpdated = !LosesRace;
            return Task.FromResult(WasUpdated);
        }

        public Task<IReadOnlyList<Polygon>> GetAllAsync(CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task AddAsync(Polygon entity, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task AddRangeAsync(IEnumerable<Polygon> entities, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task DeleteAsync(Polygon entity, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task DeleteAllAsync(CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();
    }
}
