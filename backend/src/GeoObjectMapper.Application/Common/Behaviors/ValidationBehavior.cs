using System.Linq.Expressions;
using System.Reflection;
using FluentValidation;
using GeoObjectMapper.Application.Common.Models;
using MediatR;

namespace GeoObjectMapper.Application.Common.Behaviors;

// Pipeline decorator running FluentValidation before any CQRS handler.
public sealed class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
    where TResponse : Result
{
    private static readonly Func<Error, TResponse> FailureFactory = BuildFailureFactory();

    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);
        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count != 0)
        {
            var validationErrors = failures
                .GroupBy(f => string.IsNullOrWhiteSpace(f.PropertyName) ? "general" : f.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(f => f.ErrorMessage).Distinct().ToArray());

            var errorMessage = string.Join("; ", failures.Select(f => f.ErrorMessage).Distinct());
            var error = Error.Validation(errorMessage, validationErrors);
            return FailureFactory(error);
        }

        return await next();
    }

    private static Func<Error, TResponse> BuildFailureFactory()
    {
        if (typeof(TResponse) == typeof(Result))
        {
            return error => (TResponse)(object)Result.Failure(error);
        }

        var valueType = typeof(TResponse).GetGenericArguments()[0];
        var failureMethod = typeof(Result)
            .GetMethods(BindingFlags.Public | BindingFlags.Static)
            .First(m => m.Name == nameof(Result.Failure) && m.IsGenericMethod)
            .MakeGenericMethod(valueType);

        var errorParam = Expression.Parameter(typeof(Error), "error");
        var call = Expression.Call(failureMethod, errorParam);
        var cast = Expression.Convert(call, typeof(TResponse));
        return Expression.Lambda<Func<Error, TResponse>>(cast, errorParam).Compile();
    }
}
