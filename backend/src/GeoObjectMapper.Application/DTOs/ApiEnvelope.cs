namespace GeoObjectMapper.Application.DTOs;

// Standard envelope matching frontend IApiEnvelope contract.

public sealed record class ApiEnvelope<T>
{
    public string Message { get; init; } = string.Empty;
    public T? Data { get; init; }

    public ApiEnvelope() { }

    public ApiEnvelope(string message, T? data)
    {
        Message = message;
        Data = data;
    }

    public static ApiEnvelope<T> Ok(T data, string message = "Success") => new(message, data);


}
