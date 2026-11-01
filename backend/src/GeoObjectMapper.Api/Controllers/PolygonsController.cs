using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Application.Features.Polygons.Commands;
using GeoObjectMapper.Application.Features.Polygons.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace GeoObjectMapper.Api.Controllers;

/// <summary>Manages polygons drawn on the map.</summary>
[ApiController]
[Route("api/[controller]")]
public sealed class PolygonsController : ApiControllerBase
{
    private readonly ISender _sender;

    public PolygonsController(ISender sender) => _sender = sender;

    /// <summary>Returns all polygons.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetAllPolygonsQuery(), cancellationToken);
        return Ok(ApiEnvelope<object>.Ok(new { polygons = result.Value }));
    }

    /// <summary>Returns a single polygon by id.</summary>
    /// <param name="id">Id of the polygon.</param>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetPolygonByIdQuery(id), cancellationToken);
        if (result.IsFailure)
        {
            return Failure(result.Error);
        }

        return Ok(ApiEnvelope<object>.Ok(new { polygon = result.Value }));
    }

    /// <summary>Creates a polygon and stores it as GeoJSON.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePolygonDto dto, CancellationToken cancellationToken = default)
    {
        var command = new CreatePolygonCommand(dto.Name, dto.Color, dto.Geometry);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return Failure(result.Error);
        }

        return StatusCode(201, ApiEnvelope<object>.Ok(
            new { polygon = result.Value },
            $"Saved \"{result.Value.Name}\" to MongoDB (GeoJSON)."));
    }

    /// <summary>Creates several polygons in one request.</summary>
    [HttpPost("batch")]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBatch([FromBody] BatchCreatePolygonsDto dto, CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new CreatePolygonsBatchCommand(dto.Polygons), cancellationToken);
        if (result.IsFailure) return Failure(result.Error);
        return StatusCode(201, ApiEnvelope<object>.Ok(
            new { polygons = result.Value },
            $"Saved {result.Value.Count} polygons to MongoDB (GeoJSON)."));
    }

    /// <summary>Updates a polygon. The timestamp must match the stored version.</summary>
    /// <param name="id">Id of the polygon.</param>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePolygonDto dto, CancellationToken cancellationToken = default)
    {
        var command = new UpdatePolygonCommand(
            id,
            dto.Name,
            dto.Color,
            dto.Geometry,
            dto.Timestamp);

        var result = await _sender.Send(command, cancellationToken);
        if (result.IsFailure) return Failure(result.Error);

        return Ok(ApiEnvelope<object>.Ok(new { polygon = result.Value }, $"Updated \"{result.Value.Name}\"."));
    }

    /// <summary>Deletes a single polygon by id.</summary>
    /// <param name="id">Id of the polygon.</param>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new DeletePolygonCommand(id), cancellationToken);
        if (result.IsFailure) return Failure(result.Error);
        return Ok(ApiEnvelope<bool>.Ok(true, "Deleted from database."));
    }

    /// <summary>Deletes all polygons.</summary>
    [HttpDelete]
    [ProducesResponseType(typeof(ApiEnvelope<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteAll(CancellationToken cancellationToken = default)
    {
        await _sender.Send(new DeleteAllPolygonsCommand(), cancellationToken);
        return Ok(ApiEnvelope<bool>.Ok(true, "Deleted all polygons from database."));
    }
}
