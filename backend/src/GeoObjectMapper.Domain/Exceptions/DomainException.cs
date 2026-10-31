namespace GeoObjectMapper.Domain.Exceptions;

// Base exception for all domain invariant violations.
public abstract class DomainException : Exception
{
    protected DomainException(string message) : base(message)
    {

    }

    protected DomainException(string message, Exception innerException) : base(message, innerException)
    {

    }

}
