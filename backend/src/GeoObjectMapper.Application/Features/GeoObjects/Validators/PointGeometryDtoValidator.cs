using FluentValidation;
using GeoObjectMapper.Application.DTOs;

namespace GeoObjectMapper.Application.Features.GeoObjects.Validators;

// Reusable validator for point geometry across create, batch and update operations.
public sealed class PointGeometryDtoValidator : AbstractValidator<PointGeometryDto>
{
    public PointGeometryDtoValidator()
    {
        RuleFor(x => x.Type)
            .Equal("Point")
            .WithMessage("Geometry type must be Point.");

        RuleFor(x => x.Coordinates)
            .NotNull()
            .Must(c => c != null && c.Length == 2)
            .WithMessage("Coordinates must be [lon, lat].");
    }
}
