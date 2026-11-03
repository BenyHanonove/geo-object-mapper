using GeoObjectMapper.Application.Common.Models;
using MediatR;

namespace GeoObjectMapper.Application.Common.Interfaces;

public interface ICommand<TResponse> : IRequest<Result<TResponse>>
{
}

public interface ICommandHandler<in TCommand, TResponse> : IRequestHandler<TCommand, Result<TResponse>>
    where TCommand : ICommand<TResponse>
{
}
