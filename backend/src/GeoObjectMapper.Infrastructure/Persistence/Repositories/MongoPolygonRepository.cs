using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.Exceptions;
using GeoObjectMapper.Domain.Repositories;
using GeoObjectMapper.Domain.ValueObjects;
using GeoObjectMapper.Infrastructure.Persistence.Context;
using MongoDB.Driver;

namespace GeoObjectMapper.Infrastructure.Persistence.Repositories;

// MongoDB repository implementation for Polygon entities.
public sealed class MongoPolygonRepository : IPolygonRepository
{
    // MongoDB rejects geometry the 2dsphere index cannot store with this code.
    private const int InvalidGeoJsonErrorCode = 16755;
    private const string InvalidGeoJsonMessage = "Polygon geometry is invalid. Its edges must not cross each other.";

    private readonly IMongoCollection<PolygonDocument> _collection;

    public MongoPolygonRepository(MongoDbContext context)
    {
        _collection = context.Polygons;
    }

    public async Task<Polygon?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var doc = await _collection.Find(x => x.Id == id).FirstOrDefaultAsync(cancellationToken);
        return doc == null ? null : ToDomain(doc);
    }

    public async Task<IReadOnlyList<Polygon>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var docs = await _collection.Find(_ => true).ToListAsync(cancellationToken);
        return docs.Select(ToDomain).ToList().AsReadOnly();
    }

    public async Task AddAsync(Polygon entity, CancellationToken cancellationToken = default)
    {
        try
        {
            await _collection.InsertOneAsync(ToDocument(entity), cancellationToken: cancellationToken);
        }
        catch (MongoWriteException exception) when (exception.WriteError.Code == InvalidGeoJsonErrorCode)
        {
            throw new InvalidGeometryException(InvalidGeoJsonMessage);
        }
    }

    public async Task AddRangeAsync(IEnumerable<Polygon> entities, CancellationToken cancellationToken = default)
    {
        var docs = entities.Select(ToDocument).ToList();

        try
        {
            await _collection.InsertManyAsync(docs, cancellationToken: cancellationToken);
        }
        catch (MongoBulkWriteException exception) when (exception.WriteErrors.Any(e => e.Code == InvalidGeoJsonErrorCode))
        {
            // Ordered inserts keep the documents written before the failure, so remove them.
            var ids = docs.Select(d => d.Id).ToList();
            await _collection.DeleteManyAsync(x => ids.Contains(x.Id), CancellationToken.None);

            throw new InvalidGeometryException(InvalidGeoJsonMessage);
        }
    }

    public async Task<bool> UpdateAsync(Polygon entity, DateTime expectedTimestamp, CancellationToken cancellationToken = default)
    {
        var doc = ToDocument(entity);

        try
        {
            var result = await _collection.ReplaceOneAsync(
                x => x.Id == entity.Id && x.Timestamp == expectedTimestamp,
                doc,
                cancellationToken: cancellationToken);

            return result.MatchedCount == 1;
        }
        catch (MongoWriteException exception) when (exception.WriteError.Code == InvalidGeoJsonErrorCode)
        {
            throw new InvalidGeometryException(InvalidGeoJsonMessage);
        }
    }

    public async Task DeleteAsync(Polygon entity, CancellationToken cancellationToken = default)
    {
        await _collection.DeleteOneAsync(x => x.Id == entity.Id, cancellationToken);
    }

    public async Task DeleteAllAsync(CancellationToken cancellationToken = default)
    {
        await _collection.DeleteManyAsync(_ => true, cancellationToken);
    }

    private static Polygon ToDomain(PolygonDocument doc)
    {
        var rings = doc.Geometry.Coordinates
            .Select(ring => (IReadOnlyList<Coordinate>)ring
                .Select(c => new Coordinate(c[1], c[0])) // lat = idx 1, lon = idx 0
                .ToList()
                .AsReadOnly())
            .ToList()
            .AsReadOnly();

        var geometry = new PolygonGeometry(rings);
        var entity = Polygon.Create(doc.Name, doc.Color, geometry, doc.Id);
        entity.SetTimestamp(doc.Timestamp);
        return entity;
    }

    private static PolygonDocument ToDocument(Polygon entity)
    {
        var coordinates = entity.Geometry.Coordinates
            .Select(ring => ring.Select(c => new double[] { c.Longitude, c.Latitude }).ToArray())
            .ToArray();

        return new PolygonDocument
        {
            Id = entity.Id,
            Name = entity.Name,
            Color = entity.Color,
            Geometry = new GeoJsonPolygonDocument
            {
                Type = "Polygon",
                Coordinates = coordinates
            },
            Timestamp = entity.Timestamp
        };
    }
}
