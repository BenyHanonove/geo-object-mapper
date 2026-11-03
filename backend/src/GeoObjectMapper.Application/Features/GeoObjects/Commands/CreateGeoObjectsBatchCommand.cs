using FluentValidation;
using GeoObjectMapper.Application.Common.Interfaces;
using GeoObjectMapper.Application.Common.Mappings;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Application.Features.GeoObjects.Validators;
using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.Repositories;
using GeoObjectMapper.Domain.ValueObjects;

namespace GeoObjectMapper.Application.Features.GeoObjects.Commands;

public sealed record class CreateGeoObjectsBatchCommand(
    IReadOnlyList<CreateGeoObjectDto> Objects
) : ICommand<IReadOnlyList<GeoObjectDto>>;

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

public sealed class CreateGeoObjectsBatchCommandHandler
    : ICommandHandler<CreateGeoObjectsBatchCommand, IReadOnlyList<GeoObjectDto>>
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
