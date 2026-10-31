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

// CQRS command for batch creating GeoObjects.
public sealed record class CreateGeoObjectsBatchCommand(
    IReadOnlyList<CreateGeoObjectDto> Objects
) : IRequest<Result<IReadOnlyList<GeoObjectDto>>>;

// Validator for batch payload reusing the shared CreateGeoObjectDtoValidator.
public sealed class CreateGeoObjectsBatchCommandValidator : AbstractValidator<CreateGeoObjectsBatchCommand>
{
    public CreateGeoObjectsBatchCommandValidator()
    {
        RuleFor(x => x.Objects)
            .NotEmpty()
            .WithMessage("At least one object is required.");

        RuleForEach(x => x.Objects)
            .SetValidator(new CreateGeoObjectDtoValidator());
    }
}

// Command handler for batch creation.
public sealed class CreateGeoObjectsBatchCommandHandler
    : IRequestHandler<CreateGeoObjectsBatchCommand, Result<IReadOnlyList<GeoObjectDto>>>
{
    private readonly IGeoObjectRepository _repository;

    public CreateGeoObjectsBatchCommandHandler(IGeoObjectRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IReadOnlyList<GeoObjectDto>>> Handle(
        CreateGeoObjectsBatchCommand request,
        CancellationToken cancellationToken)
    {
        var entities = request.Objects
            .Select(o => GeoObject.Create(
                o.Name,
                SymbolType.From(o.SymbolType),
                o.Geometry.ToDomain()))
            .ToList();

        await _repository.AddRangeAsync(entities, cancellationToken);

        var dtos = entities.Select(e => e.ToDto()).ToList().AsReadOnly();
        return Result.Success<IReadOnlyList<GeoObjectDto>>(dtos);
    }
}
