using FluentValidation;
using GeoObjectMapper.Application.Common.Mappings;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Application.Features.Polygons.Validators;
using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.Repositories;
using MediatR;

namespace GeoObjectMapper.Application.Features.Polygons.Commands;

// CQRS command for batch creating Polygons.
public sealed record class CreatePolygonsBatchCommand(
    IReadOnlyList<CreatePolygonDto> Polygons
) : IRequest<Result<IReadOnlyList<PolygonDto>>>;

// Validator for batch payload reusing the shared CreatePolygonDtoValidator.
public sealed class CreatePolygonsBatchCommandValidator : AbstractValidator<CreatePolygonsBatchCommand>
{
    public CreatePolygonsBatchCommandValidator()
    {
        RuleFor(x => x.Polygons)
            .NotEmpty()
            .WithMessage("At least one polygon is required.");

        RuleForEach(x => x.Polygons)
            .SetValidator(new CreatePolygonDtoValidator());
    }
}

// Command handler for batch creation.
public sealed class CreatePolygonsBatchCommandHandler
    : IRequestHandler<CreatePolygonsBatchCommand, Result<IReadOnlyList<PolygonDto>>>
{
    private readonly IPolygonRepository _repository;

    public CreatePolygonsBatchCommandHandler(IPolygonRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IReadOnlyList<PolygonDto>>> Handle(
        CreatePolygonsBatchCommand request,
        CancellationToken cancellationToken)
    {
        var entities = request.Polygons
            .Select(p => Polygon.Create(p.Name, p.Color, p.Geometry.ToDomain()))
            .ToList();

        await _repository.AddRangeAsync(entities, cancellationToken);

        var dtos = entities.Select(e => e.ToDto()).ToList().AsReadOnly();
        return Result.Success<IReadOnlyList<PolygonDto>>(dtos);
    }
}
