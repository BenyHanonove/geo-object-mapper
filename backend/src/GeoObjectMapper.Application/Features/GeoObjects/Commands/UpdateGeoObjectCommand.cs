using FluentValidation;
using GeoObjectMapper.Application.Common.Mappings;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Application.Features.GeoObjects.Validators;
using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.Repositories;
using GeoObjectMapper.Domain.ValueObjects;
using MediatR;

namespace GeoObjectMapper.Application.Features.GeoObjects.Commands;

public sealed record class UpdateGeoObjectCommand(
    Guid Id,
    string? Name,
    string? SymbolType,
    PointGeometryDto? Geometry,
    string Timestamp) : IRequest<Result<GeoObjectDto>>;

public sealed class UpdateGeoObjectCommandValidator : AbstractValidator<UpdateGeoObjectCommand>
{
    public UpdateGeoObjectCommandValidator()
    {
        RuleFor(x => x.Id)
        .NotEmpty();

        RuleFor(x => x.Timestamp)
        .NotEmpty();

        When(x => x.Name != null, () =>
            RuleFor(x => x.Name!)
            .NotEmpty()
            .MaximumLength(100)
        );


        When(x => x.SymbolType != null, () =>
            RuleFor(x => x.SymbolType!)
            .Must(s => SymbolType.All.Any(a => a.Value.Equals(s, StringComparison.OrdinalIgnoreCase)))
            .WithMessage("Invalid symbol type. Supported: marker, jeep, radar, drone.")
        );

        When(x => x.Geometry != null, () =>
            RuleFor(x => x.Geometry!)
            .SetValidator(new PointGeometryDtoValidator())
        );

    }
}

// Command handler updating the GeoObject with optimistic concurrency.

public sealed class UpdateGeoObjectCommandHandler : IRequestHandler<UpdateGeoObjectCommand, Result<GeoObjectDto>>
{
    private readonly IGeoObjectRepository _repository;

    public UpdateGeoObjectCommandHandler(IGeoObjectRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<GeoObjectDto>> Handle(
       UpdateGeoObjectCommand request,
       CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Error.NotFound("GeoObject", request.Id);
        }

        if (entity.Timestamp.ToString("o") != request.Timestamp)
        {
            return Error.Conflict("Object was modified elsewhere. Loaded latest version.");
        }


        var expectedTimestamp = entity.Timestamp;
        var symbol = request.SymbolType != null ? SymbolType.From(request.SymbolType) : null;
        var geometry = request.Geometry?.ToDomain();

        entity.Update(request.Name, symbol, geometry);

        var updated = await _repository.UpdateAsync(entity, expectedTimestamp, cancellationToken);
        if (!updated)
        {
            return Error.Conflict("Object was modified elsewhere. Loaded latest version.");
        }
        return Result.Success(entity.ToDto());
    }

}
