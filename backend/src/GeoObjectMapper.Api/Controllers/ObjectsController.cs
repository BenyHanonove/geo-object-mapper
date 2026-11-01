using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Application.Features.GeoObjects.Commands;
using GeoObjectMapper.Application.Features.GeoObjects.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace GeoObjectMapper.Api.Controllers;

/// <summary>Manages map objects such as markers and custom symbols.</summary>
[ApiController]
[Route("api/[controller]")]
public sealed class ObjectsController : ApiControllerBase
{
    private readonly ISender _sender;
    public ObjectsController(ISender sender) => _sender = sender;

    /// <summary>Returns all objects.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetAllGeoObjectsQuery(), cancellationToken);
        return Ok(ApiEnvelope<object>.Ok(new { objects = result.Value }));
    }

    /// <summary>Returns a single object by id.</summary>
    /// <param name="id">Id of the object.</param>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetGeoObjectByIdQuery(id), cancellationToken);
        if (result.IsFailure) return Failure(result.Error);
        return Ok(ApiEnvelope<object>.Ok(new { @object = result.Value }));
    }

    /// <summary>Creates an object and stores it as GeoJSON.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateGeoObjectDto dto, CancellationToken cancellationToken = default)
    {
        var command = new CreateGeoObjectCommand(dto.Name, dto.SymbolType, dto.Geometry);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure) return Failure(result.Error);

        return StatusCode(201, ApiEnvelope<object>.Ok(new { @object = result.Value }, $"Saved \"{result.Value.Name}\" to MongoDB (GeoJSON)."));
    }

    /// <summary>Creates several objects in one request.</summary>
    [HttpPost("batch")]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBatch([FromBody] BatchCreateGeoObjectsDto dto, CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new CreateGeoObjectsBatchCommand(dto.Objects), cancellationToken);
        if (result.IsFailure) return Failure(result.Error);
        return StatusCode(201, ApiEnvelope<object>.Ok(
            new { objects = result.Value },
            $"Saved {result.Value.Count} objects to MongoDB (GeoJSON)."));
    }

    /// <summary>Updates an object. The timestamp must match the stored version.</summary>
    /// <param name="id">Id of the object.</param>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGeoObjectDto dto, CancellationToken cancellationToken = default)
    {
        var command = new UpdateGeoObjectCommand(
            id,
            dto.Name,
            dto.SymbolType,
            dto.Geometry,
            dto.Timestamp
            );

        var result = await _sender.Send(command, cancellationToken);
        if (result.IsFailure) return Failure(result.Error);
        return Ok(ApiEnvelope<object>.Ok(new { @object = result.Value }, $"Updated \"{result.Value.Name}\"."));
    }

    /// <summary>Deletes a single object by id.</summary>
    /// <param name="id">Id of the object.</param>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new DeleteGeoObjectCommand(id), cancellationToken);
        if (result.IsFailure) return Failure(result.Error);
        return Ok(ApiEnvelope<bool>.Ok(true, "Deleted from database."));
    }

    /// <summary>Deletes all objects.</summary>
    [HttpDelete]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteAll(CancellationToken cancellationToken = default)
    {
        await _sender.Send(new DeleteAllGeoObjectsCommand(), cancellationToken);
        return Ok(ApiEnvelope<bool>.Ok(true, "Deleted all map objects from database."));
    }


}

