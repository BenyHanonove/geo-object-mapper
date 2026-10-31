using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Domain.Repositories;
using MediatR;

namespace GeoObjectMapper.Application.Features.Polygons.Commands;

// Command deleting a single Polygon by ID.
public sealed record class DeletePolygonCommand(Guid Id) : IRequest<Result<bool>>;

public sealed class DeletePolygonCommandHandler : IRequestHandler<DeletePolygonCommand, Result<bool>>
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

// Command deleting all Polygons (matching DELETE /polygons).
public sealed record class DeleteAllPolygonsCommand : IRequest<Result<bool>>;

public sealed class DeleteAllPolygonsCommandHandler : IRequestHandler<DeleteAllPolygonsCommand, Result<bool>>
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
