namespace GeoObjectMapper.Application.DTOs;

// GeoJSON polygon geometry DTO: coordinates are array of linear rings [[lon, lat], ...]
public sealed record class PolygonGeometryDto(string Type, double[][][] Coordinates);

// Base request contract matching frontend ICreatePolygon.
public record class CreatePolygonDto(
    string Name,
    string? Color,
    PolygonGeometryDto Geometry);

// Full persisted DTO extending CreatePolygonDto with Id and Timestamp.
public sealed record class PolygonDto(
    string Id,
    string Name,
    string? Color,
    PolygonGeometryDto Geometry,
    string Timestamp) : CreatePolygonDto(Name, Color, Geometry);

// Partial update request DTO matching frontend IUpdatePolygon.
public sealed record class UpdatePolygonDto(
    string Id,
    string? Name,
    string? Color,
    PolygonGeometryDto? Geometry,
    string Timestamp);

// Batch create request DTO matching frontend POST /polygons/batch.
public sealed record class BatchCreatePolygonsDto(
    IReadOnlyList<CreatePolygonDto> Polygons);
