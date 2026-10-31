using GeoObjectMapper.Application.Common.Mappings;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Domain.Repositories;
using MediatR;

namespace GeoObjectMapper.Application.Features.GeoObjects.Queries;

// Query to get all GeoObjects.
public sealed record class GetAllGeoObjectsQuery : IRequest<Result<IReadOnlyList<GeoObjectDto>>>;

// Query handler fetching all GeoObjects.
public sealed class GetAllGeoObjectsQueryHandler : IRequestHandler<GetAllGeoObjectsQuery, Result<IReadOnlyList<GeoObjectDto>>>
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

// Query to get a single GeoObject by ID.
public sealed record class GetGeoObjectByIdQuery(Guid Id) : IRequest<Result<GeoObjectDto>>;

// Query handler fetching a single GeoObject by ID.
public sealed class GetGeoObjectByIdQueryHandler : IRequestHandler<GetGeoObjectByIdQuery, Result<GeoObjectDto>>
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
