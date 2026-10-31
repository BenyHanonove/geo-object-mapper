namespace GeoObjectMapper.Domain.Exceptions;

// Exception for coordinates exceeding valid geographic ranges.
public sealed class InvalidCoordinatesException : DomainException
{
    public InvalidCoordinatesException(double lat, double lon)
        : base($"Coordinates ({lat}, {lon}) are out of valid range (lat [-90..90], lon [-180..180]).")
    {
    }
}
