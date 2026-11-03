using GeoObjectMapper.Application.Common.Models;
using MediatR;

namespace GeoObjectMapper.Application.Common.Interfaces;

public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}

public interface IQueryHandler<in TQuery, TResponse> : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse>
{
}
