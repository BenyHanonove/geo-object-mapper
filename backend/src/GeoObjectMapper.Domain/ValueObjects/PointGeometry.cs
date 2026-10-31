namespace GeoObjectMapper.Domain.ValueObjects;

// Immutable GeoJSON point geometry value object.
public sealed record PointGeometry
{
    public string Type { get; init; } = "Point";
    public Coordinate Coordinates { get; init; }

    public PointGeometry() { }

    public PointGeometry(Coordinate coordinates)
    {
        Coordinates = coordinates;
    }

    public PointGeometry(double latitude, double longitude)
        : this(new Coordinate(latitude, longitude)) { }

    public static PointGeometry From(double latitude, double longitude) => new(latitude, longitude);
}
