using System.Net;
using System.Text.Json;
using GeoObjectMapper.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace GeoObjectMapper.Api.Middlewares;

public sealed class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);

        var statusCode = exception switch
        {
            DomainException => (int)HttpStatusCode.BadRequest,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            TimeoutException or MongoConnectionException => (int)HttpStatusCode.ServiceUnavailable,
            _ => (int)HttpStatusCode.InternalServerError
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = statusCode switch
            {
                (int)HttpStatusCode.BadRequest => "Bad Request",
                (int)HttpStatusCode.NotFound => "Not Found",
                (int)HttpStatusCode.Unauthorized => "Unauthorized",
                (int)HttpStatusCode.ServiceUnavailable => "Service Unavailable",
                _ => "Internal Server Error"
            },
            Detail = statusCode switch
            {
                (int)HttpStatusCode.InternalServerError => "An unexpected error occurred.",
                (int)HttpStatusCode.ServiceUnavailable => "The database is unavailable. Please try again shortly.",
                _ => exception.Message
            },
            Instance = context.Request.Path
        };

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = statusCode;

        await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }
}
