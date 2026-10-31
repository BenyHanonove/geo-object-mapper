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

// CQRS command to create a new GeoObject.
public sealed record class CreateGeoObjectCommand(
    string Name,
    string SymbolType,
    PointGeometryDto Geometry
) : IRequest<Result<GeoObjectDto>>;

// Fail-fast validator for CreateGeoObjectCommand.
public sealed class CreateGeoObjectCommandValidator : AbstractValidator<CreateGeoObjectCommand>
{
    public CreateGeoObjectCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.SymbolType)
            .Must(s => SymbolType.All.Any(a => a.Value.Equals(s, StringComparison.OrdinalIgnoreCase)))
            .WithMessage("Invalid symbol type. Supported: marker, jeep, radar, drone.");

        RuleFor(x => x.Geometry)
            .NotNull()
            .SetValidator(new PointGeometryDtoValidator());
    }
}

// Command handler creating and persisting the GeoObject.
public sealed class CreateGeoObjectCommandHandler : IRequestHandler<CreateGeoObjectCommand, Result<GeoObjectDto>>
{
    private readonly IGeoObjectRepository _repository;

    public CreateGeoObjectCommandHandler(IGeoObjectRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<GeoObjectDto>> Handle(
        CreateGeoObjectCommand request,
        CancellationToken cancellationToken)
    {
        var symbolType = SymbolType.From(request.SymbolType);
        var geometry = request.Geometry.ToDomain();

        var entity = GeoObject.Create(request.Name, symbolType, geometry);

        await _repository.AddAsync(entity, cancellationToken);

        return Result.Success(entity.ToDto());
    }
}
