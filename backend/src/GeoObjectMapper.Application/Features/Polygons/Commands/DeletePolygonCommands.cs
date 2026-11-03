using GeoObjectMapper.Application.Common.Interfaces;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Domain.Repositories;

namespace GeoObjectMapper.Application.Features.Polygons.Commands;

public sealed record class DeletePolygonCommand(Guid Id) : ICommand<bool>;

public sealed class DeletePolygonCommandHandler : ICommandHandler<DeletePolygonCommand, bool>
{
    private readonly IPolygonRepository _repository;

    public DeletePolygonCommandHandler(IPolygonRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeletePolygonCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Error.NotFound("Polygon", request.Id);
        }

        await _repository.DeleteAsync(entity, cancellationToken);

        return Result.Success(true);
    }
}

public sealed record class DeleteAllPolygonsCommand : ICommand<bool>;

public sealed class DeleteAllPolygonsCommandHandler : ICommandHandler<DeleteAllPolygonsCommand, bool>
{
    private readonly IPolygonRepository _repository;

    public DeleteAllPolygonsCommandHandler(IPolygonRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeleteAllPolygonsCommand request, CancellationToken cancellationToken)
    {
        await _repository.DeleteAllAsync(cancellationToken);

        return Result.Success(true);
    }
}
