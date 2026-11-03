using GeoObjectMapper.Application.Common.Interfaces;
using GeoObjectMapper.Application.Common.Mappings;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Domain.Repositories;

namespace GeoObjectMapper.Application.Features.GeoObjects.Queries;

public sealed record class GetAllGeoObjectsQuery : IQuery<IReadOnlyList<GeoObjectDto>>;

public sealed class GetAllGeoObjectsQueryHandler : IQueryHandler<GetAllGeoObjectsQuery, IReadOnlyList<GeoObjectDto>>
{
    private readonly IGeoObjectRepository _repository;

    public GetAllGeoObjectsQueryHandler(IGeoObjectRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IReadOnlyList<GeoObjectDto>>> Handle(
        GetAllGeoObjectsQuery request,
        CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        var dtos = entities.Select(e => e.ToDto()).ToList().AsReadOnly();

        return Result.Success<IReadOnlyList<GeoObjectDto>>(dtos);
    }
}

public sealed record class GetGeoObjectByIdQuery(Guid Id) : IQuery<GeoObjectDto>;

public sealed class GetGeoObjectByIdQueryHandler : IQueryHandler<GetGeoObjectByIdQuery, GeoObjectDto>
{
    private readonly IGeoObjectRepository _repository;

    public GetGeoObjectByIdQueryHandler(IGeoObjectRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<GeoObjectDto>> Handle(
        GetGeoObjectByIdQuery request,
        CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Error.NotFound("GeoObject", request.Id);
        }

        return Result.Success(entity.ToDto());
    }
}
