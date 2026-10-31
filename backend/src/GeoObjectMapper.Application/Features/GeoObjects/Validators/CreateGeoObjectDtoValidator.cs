using FluentValidation;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Domain.ValueObjects;

namespace GeoObjectMapper.Application.Features.GeoObjects.Validators;

// Reusable validator for CreateGeoObjectDto across single and batch operations.
public sealed class CreateGeoObjectDtoValidator : AbstractValidator<CreateGeoObjectDto>
{
    public CreateGeoObjectDtoValidator()
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
