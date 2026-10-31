namespace GeoObjectMapper.Application.DTOs;

// GeoJSON coordinate point DTO: { type: "Point", coordinates: [lon, lat] }
public sealed record class PointGeometryDto(string Type, double[] Coordinates);

// Base request contract matching frontend ICreateGeoObject.
public record class CreateGeoObjectDto(
    string Name,
    string SymbolType,
    PointGeometryDto Geometry);

// Full persisted DTO extending CreateGeoObjectDto with Id and Timestamp.
public sealed record class GeoObjectDto(
    string Id,
    string Name,
    string SymbolType,
    PointGeometryDto Geometry,
    string Timestamp) : CreateGeoObjectDto(Name, SymbolType, Geometry);

// Partial update request DTO matching frontend IUpdateGeoObject.
public sealed record class UpdateGeoObjectDto(
    string Id,
    string? Name,
    string? SymbolType,
    PointGeometryDto? Geometry,
    string Timestamp);

// Batch create request DTO matching frontend POST /objects/batch.
public sealed record class BatchCreateGeoObjectsDto(
    IReadOnlyList<CreateGeoObjectDto> Objects);
