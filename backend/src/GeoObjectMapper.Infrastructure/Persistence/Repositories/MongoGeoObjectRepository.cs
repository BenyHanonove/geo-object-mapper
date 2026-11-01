using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.Repositories;
using GeoObjectMapper.Domain.ValueObjects;
using GeoObjectMapper.Infrastructure.Persistence.Context;
using MongoDB.Driver;

namespace GeoObjectMapper.Infrastructure.Persistence.Repositories;

// MongoDB repository implementation for GeoObject entities.

public sealed class MongoGeoObjectRepository : IGeoObjectRepository
{
    private readonly IMongoCollection<GeoObjectDocument> _collection;

    public MongoGeoObjectRepository(MongoDbContext context) => _collection = context.GeoObjects;

    public async Task<GeoObject?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var doc = await _collection.Find(x => x.Id == id).FirstOrDefaultAsync(cancellationToken);
        return doc == null ? null : ToDomain(doc);
    }

    public async Task<IReadOnlyList<GeoObject>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var docs = await _collection.Find(_ => true).ToListAsync(cancellationToken);
        return docs.Select(ToDomain).ToList().AsReadOnly();
    }

    public async Task AddAsync(
   GeoObject entity, CancellationToken cancellationToken)
    {
        await _collection.InsertOneAsync(ToDocument(entity), cancellationToken: cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<GeoObject> entities, CancellationToken cancellationToken)
    {
        var docs = entities.Select(ToDocument);
        await _collection.InsertManyAsync(docs, cancellationToken: cancellationToken);
    }

    public async Task<bool> UpdateAsync(GeoObject entity, DateTime expectedTimestamp, CancellationToken cancellationToken = default)
    {
        var doc = ToDocument(entity);
        var result = await _collection.ReplaceOneAsync(
            x => x.Id == entity.Id && x.Timestamp == expectedTimestamp,
            doc,
            cancellationToken: cancellationToken);

        return result.MatchedCount == 1;
    }

    public async Task DeleteAsync(GeoObject entity, CancellationToken cancellationToken = default)
    {
        await _collection.DeleteOneAsync(x => x.Id == entity.Id, cancellationToken);
    }

    public async Task DeleteAllAsync(CancellationToken cancellationToken)
    {
        await _collection.DeleteManyAsync(_ => true, cancellationToken);
    }

    private static GeoObject ToDomain(GeoObjectDocument doc)
    {
        var symbol = SymbolType.From(doc.SymbolType);
        var geometry = PointGeometry.From(doc.Geometry.Coordinates[1], doc.Geometry.Coordinates[0]);
        var entity = GeoObject.Create(doc.Name, symbol, geometry, doc.Id);
        entity.SetTimestamp(doc.Timestamp);
        return entity;
    }

    private static GeoObjectDocument ToDocument(GeoObject entity)
    {
        return new GeoObjectDocument
        {
            Id = entity.Id,
            Name = entity.Name,
            SymbolType = entity.SymbolType.Value,
            Geometry = new GeoJsonPointDocument
            {
                Type = "Point",
                Coordinates = [
                      entity.Geometry.Coordinates.Longitude,
                    entity.Geometry.Coordinates.Latitude,
                ],
            },
            Timestamp = entity.Timestamp,


        };
    }

}
