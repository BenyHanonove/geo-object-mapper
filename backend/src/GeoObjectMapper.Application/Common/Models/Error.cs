using System.Runtime.CompilerServices;

namespace GeoObjectMapper.Application.Common.Models;

// Strongly-typed domain and application error record.
public sealed record class Error
{
    public string Code { get; init; }
    public string Description { get; init; }

    public Error(string code, string description)
    {
        Code = code;
        Description = description;
    }

    public static readonly Error None = new(string.Empty, string.Empty);

    public static Error NotFound(string entityName, object id) => new($"{entityName}.NotFound", $"{entityName} with id '{id}' was not found.");

    public static Error Validation(string message) => new("Validation.General", message);

    public static Error Conflict(string message) => new("Conflict.VersionMismatch", message);
}
