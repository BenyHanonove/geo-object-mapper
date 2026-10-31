using GeoObjectMapper.Domain.Common;
using GeoObjectMapper.Domain.Exceptions;
using GeoObjectMapper.Domain.ValueObjects;

namespace GeoObjectMapper.Domain.Entities;

// Aggregate root representing a map point object.
public sealed class GeoObject : BaseEntity, IAggregateRoot
{
    public string Name { get; private set; } = null!;
    public SymbolType SymbolType { get; private set; } = null!;
    public PointGeometry Geometry { get; private set; } = null!;

    private GeoObject() { }
    private GeoObject(Guid id, string name, SymbolType symbolType, PointGeometry geometry, DateTime timestamp)
      : base(id, timestamp) { Name = name; SymbolType = symbolType; Geometry = geometry; }


    public static GeoObject Create(string name, SymbolType symbolType, PointGeometry geometry, Guid? id = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidGeometryException("Object name cannot be empty.");
        }

        var entity = new GeoObject(id ?? Guid.NewGuid(), name.Trim(), symbolType, geometry, DateTime.UtcNow);
        return entity;
    }


    public void Update(string? name, SymbolType? symbolType, PointGeometry? geometry)
    {
        if (name != null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new InvalidGeometryException("Object name cannot be empty.");
            }
            Name = name.Trim();
        }

        if (symbolType != null)
        {
            SymbolType = symbolType;
        }

        if (geometry != null)
        {
            Geometry = geometry;
        }

        SetTimestamp(DateTime.UtcNow);
    }


}
