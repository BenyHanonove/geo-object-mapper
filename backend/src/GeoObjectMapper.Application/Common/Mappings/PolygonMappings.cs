using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.ValueObjects;

namespace GeoObjectMapper.Application.Common.Mappings;

// Type-safe mapping extension methods for Polygon contracts.
public static class PolygonMappings
{
    public static PolygonGeometryDto ToDto(this PolygonGeometry geometry)
    {
        var coordinates = geometry.Coordinates
            .Select(ring => ring.Select(c => new double[] { c.Longitude, c.Latitude }).ToArray())
            .ToArray();

        return new PolygonGeometryDto("Polygon", coordinates);
    }

    public static PolygonDto ToDto(this Polygon entity) => new(
        entity.Id.ToString(),
        entity.Name,
        entity.Color,
        entity.Geometry.ToDto(),
        entity.Timestamp.ToString("o")
    );

    public static PolygonGeometry ToDomain(this PolygonGeometryDto dto)
    {
        var rings = dto.Coordinates
            .Select(ring => (IReadOnlyList<Coordinate>)ring
                .Select(c => new Coordinate(c[1], c[0])) // lat = idx 1, lon = idx 0
                .ToList()
                .AsReadOnly())
            .ToList()
            .AsReadOnly();

        return new PolygonGeometry(rings);
    }
}
