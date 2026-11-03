using GeoObjectMapper.Domain.Entities;
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

    [Fact]
    public void Polygon_rejects_an_open_inner_hole_ring()
    {
        var outer = new[]
        {
            new Coordinate(0, 0),
            new Coordinate(0, 10),
            new Coordinate(10, 10),
            new Coordinate(10, 0),
            new Coordinate(0, 0)
        };
        var openHole = new[]
        {
            new Coordinate(2, 2),
            new Coordinate(2, 4),
            new Coordinate(4, 4),
            new Coordinate(4, 2)
        };

        var ex = Assert.Throws<InvalidGeometryException>(() => new PolygonGeometry([outer, openHole]));
        Assert.Contains("inner ring 1", ex.Message);
    }

    [Fact]
    public void Polygon_accepts_closed_outer_and_inner_rings()
    {
        var outer = new[]
        {
            new Coordinate(0, 0),
            new Coordinate(0, 10),
            new Coordinate(10, 10),
            new Coordinate(10, 0),
            new Coordinate(0, 0)
        };
        var closedHole = new[]
        {
            new Coordinate(2, 2),
            new Coordinate(2, 4),
            new Coordinate(4, 4),
            new Coordinate(2, 2)
        };

        var geometry = new PolygonGeometry([outer, closedHole]);
        Assert.Equal(2, geometry.Coordinates.Count);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Entities_throw_InvalidEntityNameException_when_name_is_blank(string badName)
    {
        var point = PointGeometry.From(32.08, 34.78);
        var ring = PolygonGeometry.FromRing(
        [
            new Coordinate(32.0, 34.7),
            new Coordinate(32.1, 34.7),
            new Coordinate(32.1, 34.8),
            new Coordinate(32.0, 34.7)
        ]);

        Assert.Throws<InvalidEntityNameException>(() => GeoObject.Create(badName, SymbolType.Jeep, point));
        Assert.Throws<InvalidEntityNameException>(() => Polygon.Create(badName, "#2563EB", ring));
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
