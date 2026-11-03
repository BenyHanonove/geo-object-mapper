using FluentValidation;
using GeoObjectMapper.Application.Common.Interfaces;
using GeoObjectMapper.Application.Common.Mappings;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Application.Features.Polygons.Validators;
using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.Repositories;

namespace GeoObjectMapper.Application.Features.Polygons.Commands;

public sealed record class CreatePolygonCommand(
    string Name,
    string? Color,
    PolygonGeometryDto Geometry
) : ICommand<PolygonDto>;

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

public sealed class CreatePolygonCommandHandler : ICommandHandler<CreatePolygonCommand, PolygonDto>
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
