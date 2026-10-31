using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Domain.Repositories;
using MediatR;

namespace GeoObjectMapper.Application.Features.GeoObjects.Commands;

// Command deleting a single GeoObject by ID.
public sealed record class DeleteGeoObjectCommand(Guid Id) : IRequest<Result<bool>>;

public sealed class DeleteGeoObjectCommandHandler : IRequestHandler<DeleteGeoObjectCommand, Result<bool>>
{
    private readonly IGeoObjectRepository _repository;

    public DeleteGeoObjectCommandHandler(IGeoObjectRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeleteGeoObjectCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Error.NotFound("GeoObject", request.Id);
        }

        await _repository.DeleteAsync(entity, cancellationToken);

        return Result.Success(true);
    }
}

// Command deleting all GeoObjects (matching DELETE /objects).
public sealed record class DeleteAllGeoObjectsCommand : IRequest<Result<bool>>;

public sealed class DeleteAllGeoObjectsCommandHandler : IRequestHandler<DeleteAllGeoObjectsCommand, Result<bool>>
{
    private readonly IGeoObjectRepository _repository;

    public DeleteAllGeoObjectsCommandHandler(IGeoObjectRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeleteAllGeoObjectsCommand request, CancellationToken cancellationToken)
    {
        await _repository.DeleteAllAsync(cancellationToken);

        return Result.Success(true);
    }
}
