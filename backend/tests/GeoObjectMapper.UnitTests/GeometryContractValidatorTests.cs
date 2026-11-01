using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Application.Features.GeoObjects.Validators;
using GeoObjectMapper.Application.Features.Polygons.Validators;

namespace GeoObjectMapper.UnitTests;

public class GeometryContractValidatorTests
{
    private static readonly PolygonGeometryDto Square = new(
        "Polygon",
        [[[0, 0], [1, 0], [1, 1], [0, 0]]]);

    [Fact]
    public void Polygon_geometry_must_declare_the_polygon_type()
    {
        var result = new PolygonGeometryDtoValidator().Validate(Square with { Type = "Banana" });

        Assert.Contains(result.Errors, e => e.ErrorMessage == "Geometry type must be Polygon.");
    }

    [Fact]
    public void Point_geometry_must_declare_the_point_type()
    {
        var result = new PointGeometryDtoValidator().Validate(new PointGeometryDto("Polygon", [34, 32]));

        Assert.Contains(result.Errors, e => e.ErrorMessage == "Geometry type must be Point.");
    }

    [Theory]
    [InlineData("#2563eb", true)]
    [InlineData(null, true)]
    [InlineData("red", false)]
    [InlineData("#12345", false)]
    public void Polygon_color_must_be_hex(string? color, bool isValid)
    {
        var dto = new CreatePolygonDto("Zone", color, Square);

        Assert.Equal(isValid, new CreatePolygonDtoValidator().Validate(dto).IsValid);
    }
}
