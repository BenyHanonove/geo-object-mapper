using GeoObjectMapper.Domain.Exceptions;
using GeoObjectMapper.Domain.ValueObjects;

namespace GeoObjectMapper.UnitTests;

public class GeometryTests
{
    [Theory]
    [InlineData(90.1, 0)]
    [InlineData(-90.1, 0)]
    [InlineData(0, 180.1)]
    [InlineData(0, -180.1)]
    public void Coordinate_rejects_out_of_range_values(double latitude, double longitude)
    {
        Assert.Throws<InvalidCoordinatesException>(() => new Coordinate(latitude, longitude));
    }

    [Fact]
    public void Polygon_rejects_a_ring_with_too_few_coordinates()
    {
        var ring = new[] { new Coordinate(0, 0), new Coordinate(1, 1), new Coordinate(0, 0) };

        Assert.Throws<InvalidGeometryException>(() => PolygonGeometry.FromRing(ring));
    }

    [Fact]
    public void Polygon_rejects_an_open_ring()
    {
        var ring = new[]
        {
            new Coordinate(0, 0),
            new Coordinate(0, 1),
            new Coordinate(1, 1),
            new Coordinate(1, 0)
        };

        Assert.Throws<InvalidGeometryException>(() => PolygonGeometry.FromRing(ring));
    }

    [Theory]
    [InlineData("jeep")]
    [InlineData("JEEP")]
    public void SymbolType_is_case_insensitive(string value)
    {
        Assert.Equal(SymbolType.Jeep, SymbolType.From(value));
    }

    [Fact]
    public void SymbolType_rejects_unknown_values()
    {
        Assert.Throws<InvalidSymbolTypeException>(() => SymbolType.From("tank"));
    }
}
