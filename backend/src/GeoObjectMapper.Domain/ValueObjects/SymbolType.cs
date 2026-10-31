using System.Collections.ObjectModel;
using GeoObjectMapper.Domain.Exceptions;

namespace GeoObjectMapper.Domain.ValueObjects;

// Strongly-typed value object representing supported map symbols.
public sealed record class SymbolType
{
    public string Value { get; init; } = string.Empty;

    public static readonly SymbolType Marker = new("marker");
    public static readonly SymbolType Jeep = new("jeep");
    public static readonly SymbolType Radar = new("radar");
    public static readonly SymbolType Drone = new("drone");

    public static readonly IReadOnlyList<SymbolType> All = [Marker, Jeep, Radar, Drone];

    public SymbolType() { }


    private SymbolType(string value)
    {
        Value = value;
    }

    public static SymbolType From(string value)
    {
        return All.FirstOrDefault(s => s.Value.Equals(value, StringComparison.OrdinalIgnoreCase)) ??
            throw new InvalidSymbolTypeException(value);

    }

    public override string ToString() => Value;

}
