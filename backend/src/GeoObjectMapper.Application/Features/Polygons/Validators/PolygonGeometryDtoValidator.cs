using FluentValidation;
using GeoObjectMapper.Application.DTOs;

namespace GeoObjectMapper.Application.Features.Polygons.Validators;

// Reusable validator for polygon geometry across create, batch and update operations.
public sealed class PolygonGeometryDtoValidator : AbstractValidator<PolygonGeometryDto>
{
    public PolygonGeometryDtoValidator()
    {
        RuleFor(x => x.Type)
            .Equal("Polygon")
            .WithMessage("Geometry type must be Polygon.");

        RuleFor(x => x.Coordinates)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .WithMessage("Polygon must contain at least one ring.")
            .Must(rings => rings.All(ring => ring != null && ring.All(c => c != null && c.Length == 2)))
            .WithMessage("Coordinates must be [lon, lat].")
            .Must(rings => rings.All(ring => ring.Length >= 4))
            .WithMessage("Each polygon ring must contain at least 4 coordinates.")
            .Must(rings => rings.All(ring => ring[0].SequenceEqual(ring[^1])))
            .WithMessage("Each polygon ring must be closed (first coordinate must match last).");
    }
}
