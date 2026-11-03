namespace GeoObjectMapper.Application.Common.Models;

// Strongly-typed domain and application error record.
public sealed record class Error
{
    public string Code { get; init; }
    public string Description { get; init; }
    public IReadOnlyDictionary<string, string[]>? ValidationErrors { get; init; }

    public Error(
        string code,
        string description,
        IReadOnlyDictionary<string, string[]>? validationErrors = null)
    {
        Code = code;
        Description = description;
        ValidationErrors = validationErrors;
    }

    public static readonly Error None = new(string.Empty, string.Empty);

    public static Error NotFound(string entityName, object id) =>
        new($"{entityName}.NotFound", $"{entityName} with id '{id}' was not found.");

    public static Error Validation(
        string message,
        IReadOnlyDictionary<string, string[]>? validationErrors = null) =>
        new("Validation.General", message, validationErrors);

    public static Error Conflict(string message) =>
        new("Conflict.VersionMismatch", message);
}
