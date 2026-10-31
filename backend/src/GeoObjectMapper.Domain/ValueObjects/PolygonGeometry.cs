using GeoObjectMapper.Domain.Exceptions;

namespace GeoObjectMapper.Domain.ValueObjects;

// Immutable GeoJSON polygon geometry value object.
public sealed record class PolygonGeometry
{
    public string Type { get; init; } = "Polygon";
    public IReadOnlyList<IReadOnlyList<Coordinate>> Coordinates { get; init; } = [];
    public PolygonGeometry() { }
    public PolygonGeometry(IReadOnlyList<IReadOnlyList<Coordinate>> coordinates)
    {
        if (coordinates == null || coordinates.Count == 0)
        {
            throw new InvalidGeometryException("Polygon coordinates cannot be null or empty.");
        }

        var outerRing = coordinates[0];

        if (outerRing.Count < 4)
        {
            throw new InvalidGeometryException("Polygon outer ring must contain at least 4 coordinates.");

        }

        if (outerRing[0] != outerRing[^1])
        {
            throw new InvalidGeometryException("Polygon outer ring must be closed (first coordinate must match last).");
        }

        Coordinates = coordinates;

    }

    public static PolygonGeometry FromRing(IEnumerable<Coordinate> ring)
        => new([ring.ToList().AsReadOnly()]);
}
