namespace GeoObjectMapper.Domain.Exceptions;

// Exception for invalid GeoJSON geometry definitions.
public sealed class InvalidGeometryException : DomainException
{
    public InvalidGeometryException(string message) : base(message) { }
}
