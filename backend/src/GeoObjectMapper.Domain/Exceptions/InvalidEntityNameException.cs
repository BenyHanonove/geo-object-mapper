namespace GeoObjectMapper.Domain.Exceptions;

// Domain exception thrown when an entity name is missing or whitespace.
public sealed class InvalidEntityNameException : DomainException
{
    public InvalidEntityNameException(string message) : base(message)
    {
    }
}
