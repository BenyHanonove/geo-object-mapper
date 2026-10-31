namespace GeoObjectMapper.Domain.Exceptions;

// Exception thrown when an unknown symbol type is provided.
public sealed class InvalidSymbolTypeException : DomainException
{
    public InvalidSymbolTypeException(string symbolType)
        : base($"Unsupported symbol type: '{symbolType}'. Supported types are: marker, jeep, radar, drone.")
    {
    }
}
