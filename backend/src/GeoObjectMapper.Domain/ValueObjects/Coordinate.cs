using GeoObjectMapper.Domain.Exceptions;

namespace GeoObjectMapper.Domain.ValueObjects;

// Immutable value object representing geographic coordinates.
public readonly record struct Coordinate
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }

    public Coordinate(double latitude, double longitude)
    {
        if (Math.Abs(latitude) > 90 || Math.Abs(longitude) > 180)
        {
            throw new InvalidCoordinatesException(latitude, longitude);
        }

        Latitude = latitude;
        Longitude = longitude;

    }

    public static Coordinate Create(double latitude, double longitude) => new(latitude, longitude);

}
