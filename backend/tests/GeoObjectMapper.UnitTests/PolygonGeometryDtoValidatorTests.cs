using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Application.Features.Polygons.Validators;

namespace GeoObjectMapper.UnitTests;

public class PolygonGeometryDtoValidatorTests
{
    private readonly PolygonGeometryDtoValidator _validator = new();

    private static PolygonGeometryDto Geometry(params double[][] ring) => new("Polygon", [ring]);

    [Fact]
    public void Accepts_a_closed_ring()
    {
        var result = _validator.Validate(Geometry([0, 0], [1, 0], [1, 1], [0, 0]));

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Rejects_an_open_ring()
    {
        var result = _validator.Validate(Geometry([0, 0], [1, 0], [1, 1], [0, 1]));

        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("closed"));
    }

    [Fact]
    public void Rejects_a_ring_with_too_few_coordinates()
    {
        var result = _validator.Validate(Geometry([0, 0], [1, 0], [0, 0]));

        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("at least 4"));
    }

    [Fact]
    public void Rejects_positions_that_are_not_lon_lat_pairs()
    {
        var result = _validator.Validate(Geometry([0], [1, 0], [1, 1], [0]));

        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("[lon, lat]"));
    }
}
