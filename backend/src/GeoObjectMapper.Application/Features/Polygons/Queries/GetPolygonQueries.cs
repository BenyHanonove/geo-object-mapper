using GeoObjectMapper.Application.Common.Mappings;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Domain.Repositories;
using MediatR;

namespace GeoObjectMapper.Application.Features.Polygons.Queries;

// Query to get all Polygons.
public sealed record class GetAllPolygonsQuery : IRequest<Result<IReadOnlyList<PolygonDto>>>;

public sealed class GetAllPolygonsQueryHandler : IRequestHandler<GetAllPolygonsQuery, Result<IReadOnlyList<PolygonDto>>>
{
    private readonly IPolygonRepository _repository;

    public GetAllPolygonsQueryHandler(IPolygonRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IReadOnlyList<PolygonDto>>> Handle(
        GetAllPolygonsQuery request,
        CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        var dtos = entities.Select(e => e.ToDto()).ToList().AsReadOnly();

        return Result.Success<IReadOnlyList<PolygonDto>>(dtos);
    }
}

// Query to get a single Polygon by ID.
public sealed record class GetPolygonByIdQuery(Guid Id) : IRequest<Result<PolygonDto>>;

public sealed class GetPolygonByIdQueryHandler : IRequestHandler<GetPolygonByIdQuery, Result<PolygonDto>>
{
    private readonly IPolygonRepository _repository;

    public GetPolygonByIdQueryHandler(IPolygonRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PolygonDto>> Handle(
        GetPolygonByIdQuery request,
        CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Error.NotFound("Polygon", request.Id);
        }

        return Result.Success(entity.ToDto());
    }
}
