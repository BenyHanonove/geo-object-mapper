using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.ValueObjects;

namespace GeoObjectMapper.Application.Common.Mappings;

// Type-safe mapping extension methods for GeoObject contracts.
public static class GeoObjectMappings
{
    public static PointGeometryDto ToDto(this PointGeometry geometry) =>
        new("Point", [geometry.Coordinates.Longitude, geometry.Coordinates.Latitude]);

    public static GeoObjectDto ToDto(this GeoObject entity) => new(
        entity.Id.ToString(),
        entity.Name,
        entity.SymbolType.Value,
        entity.Geometry.ToDto(),
        entity.Timestamp.ToString("o")
    );

    public static PointGeometry ToDomain(this PointGeometryDto dto) =>
        PointGeometry.From(dto.Coordinates[1], dto.Coordinates[0]);
}
