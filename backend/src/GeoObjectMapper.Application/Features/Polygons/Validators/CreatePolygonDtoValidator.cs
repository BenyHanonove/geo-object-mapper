using FluentValidation;
using GeoObjectMapper.Application.DTOs;

namespace GeoObjectMapper.Application.Features.Polygons.Validators;

// Reusable validator for CreatePolygonDto across batch operations.
public sealed class CreatePolygonDtoValidator : AbstractValidator<CreatePolygonDto>
{
    public CreatePolygonDtoValidator()
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
