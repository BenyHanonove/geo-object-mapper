using FluentValidation;
using GeoObjectMapper.Application.Common.Mappings;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Application.Features.Polygons.Validators;
using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.Repositories;
using MediatR;

namespace GeoObjectMapper.Application.Features.Polygons.Commands;

// CQRS command to create a new Polygon.
public sealed record class CreatePolygonCommand(
    string Name,
    string? Color,
    PolygonGeometryDto Geometry
) : IRequest<Result<PolygonDto>>;

// Validator for Polygon creation.
public sealed class CreatePolygonCommandValidator : AbstractValidator<CreatePolygonCommand>
{
    public CreatePolygonCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Color)
            .Matches(PolygonColorRule.Pattern)
            .WithMessage(PolygonColorRule.Message);

        RuleFor(x => x.Geometry)
            .NotNull()
            .SetValidator(new PolygonGeometryDtoValidator());
    }
}

// Command handler for creating and persisting a Polygon.
public sealed class CreatePolygonCommandHandler : IRequestHandler<CreatePolygonCommand, Result<PolygonDto>>
{
    private readonly IPolygonRepository _repository;

    public CreatePolygonCommandHandler(IPolygonRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PolygonDto>> Handle(
        CreatePolygonCommand request,
        CancellationToken cancellationToken)
    {
        var geometry = request.Geometry.ToDomain();
        var entity = Polygon.Create(request.Name, request.Color, geometry);

        await _repository.AddAsync(entity, cancellationToken);

        return Result.Success(entity.ToDto());
    }
}
