using GeoObjectMapper.Domain.Common;
using GeoObjectMapper.Domain.Exceptions;
using GeoObjectMapper.Domain.ValueObjects;

namespace GeoObjectMapper.Domain.Entities;

// Aggregate root representing a map polygon.
public sealed class Polygon : BaseEntity, IAggregateRoot
{
    public string Name { get; private set; } = null!;
    public string? Color { get; private set; }
    public PolygonGeometry Geometry { get; private set; } = null!;

    private Polygon() { }

    private Polygon(Guid id, string name, string? color, PolygonGeometry geometry, DateTime timestamp)
        : base(id, timestamp)
    {
        Name = name;
        Color = color;
        Geometry = geometry;
    }

    public static Polygon Create(string name, string? color, PolygonGeometry geometry, Guid? id = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidGeometryException("Polygon name cannot be empty.");
        }

        var polygon = new Polygon(id ?? Guid.NewGuid(), name.Trim(), color?.Trim(), geometry, DateTime.UtcNow);
        return polygon;
    }

    public void Update(string? name, string? color, PolygonGeometry? geometry)
    {
        if (name != null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new InvalidGeometryException("Polygon name cannot be empty.");
            }
            Name = name.Trim();
        }

        if (color != null)
        {
            Color = string.IsNullOrWhiteSpace(color) ? null : color.Trim();
        }

        if (geometry != null)
        {
            Geometry = geometry;
        }

        SetTimestamp(DateTime.UtcNow);
    }
}
