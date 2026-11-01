namespace GeoObjectMapper.Api.Middlewares;


public sealed class CorrelationIdMiddleware
{
    public const string HeaderKey = "X-Correlation-Id";
    private readonly RequestDelegate _next;
    private readonly ILogger<CorrelationIdMiddleware> _logger;

    public CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Headers.TryGetValue(HeaderKey, out var correlationId)
            || string.IsNullOrWhiteSpace(correlationId))
        {
            correlationId = Guid.NewGuid().ToString("N");
        }

        context.Items[HeaderKey] = correlationId.ToString();

        context.Response.OnStarting(() =>
        {
            context.Response.Headers[HeaderKey] = correlationId;
            return Task.CompletedTask;
        });

        using (_logger.BeginScope("CorrelationId: {CorrelationId}", correlationId.ToString()))
        {
            await _next(context);
        }
    }

}
