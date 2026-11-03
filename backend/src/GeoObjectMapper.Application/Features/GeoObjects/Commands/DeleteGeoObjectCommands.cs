using GeoObjectMapper.Application.Common.Interfaces;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Domain.Repositories;

namespace GeoObjectMapper.Application.Features.GeoObjects.Commands;

public sealed record class DeleteGeoObjectCommand(Guid Id) : ICommand<bool>;

public sealed class DeleteGeoObjectCommandHandler : ICommandHandler<DeleteGeoObjectCommand, bool>
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

public sealed record class DeleteAllGeoObjectsCommand : ICommand<bool>;

public sealed class DeleteAllGeoObjectsCommandHandler : ICommandHandler<DeleteAllGeoObjectsCommand, bool>
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
