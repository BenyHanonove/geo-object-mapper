using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace GeoObjectMapper.Application.Common.Behaviors;

// Pipeline decorator for structured logging and performance tracking.

public sealed class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger) => _logger = logger;


    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        _logger.LogInformation("Handling {RequestName}", requestName);

        var stopwatch = Stopwatch.StartNew();
        var response = await next();
        stopwatch.Stop();

        if (stopwatch.ElapsedMilliseconds > 500)
        {
            _logger.LogWarning("Long running request: {RequestName} ({ElapsedMilliseconds} ms)",
                requestName, stopwatch.ElapsedMilliseconds);
        }
        else
        {
            _logger.LogInformation("Handled {RequestName} in {ElapsedMilliseconds} ms",
                requestName, stopwatch.ElapsedMilliseconds);
        }

        return response;
    }

}
