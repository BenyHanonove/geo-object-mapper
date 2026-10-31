namespace GeoObjectMapper.Application.Common.Models;

// Functional Result pattern for type-safe outcomes.
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error Error { get; }

    protected Result(bool isSuccess, Error error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, Error.None);
    public static Result Failure(Error error) => new(false, error);

    public static Result<T> Success<T>(T value) => new(value, true, Error.None);
    public static Result<T> Failure<T>(Error error) => new(default!, false, error);

}


public class Result<TValue> : Result
{
    public TValue Value { get; }

    protected internal Result(TValue value, bool IsSuccess, Error error) : base(IsSuccess, error)
    {
        Value = value;
    }

    public static implicit operator Result<TValue>(TValue value) => Result.Success(value);
    public static implicit operator Result<TValue>(Error error) => Result.Failure<TValue>(error);


}
