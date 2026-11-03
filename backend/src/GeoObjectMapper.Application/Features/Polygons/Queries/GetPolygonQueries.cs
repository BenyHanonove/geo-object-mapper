using GeoObjectMapper.Application.Common.Interfaces;
using GeoObjectMapper.Application.Common.Mappings;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Domain.Repositories;

namespace GeoObjectMapper.Application.Features.Polygons.Queries;

public sealed record class GetAllPolygonsQuery : IQuery<IReadOnlyList<PolygonDto>>;

public sealed class GetAllPolygonsQueryHandler : IQueryHandler<GetAllPolygonsQuery, IReadOnlyList<PolygonDto>>
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

public sealed record class GetPolygonByIdQuery(Guid Id) : IQuery<PolygonDto>;

public sealed class GetPolygonByIdQueryHandler : IQueryHandler<GetPolygonByIdQuery, PolygonDto>
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
