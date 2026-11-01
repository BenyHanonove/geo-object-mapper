using GeoObjectMapper.Infrastructure.Options;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace GeoObjectMapper.Infrastructure.Persistence.Context;

// BSON document representing GeoObject stored in MongoDB with 2dsphere index.
public class GeoObjectDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string SymbolType { get; set; } = string.Empty;

    public GeoJsonPointDocument Geometry { get; set; } = new();

    public DateTime Timestamp { get; set; }
}

public class GeoJsonPointDocument
{
    [BsonElement("type")]
    public string Type { get; set; } = "Point";

    [BsonElement("coordinates")]
    public double[] Coordinates { get; set; } = []; // [longitude, latitude]
}

// BSON document representing Polygon stored in MongoDB with 2dsphere index.
public class PolygonDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Color { get; set; }

    public GeoJsonPolygonDocument Geometry { get; set; } = new();

    public DateTime Timestamp { get; set; }
}

public class GeoJsonPolygonDocument
{
    [BsonElement("type")]
    public string Type { get; set; } = "Polygon";

    [BsonElement("coordinates")]
    public double[][][] Coordinates { get; set; } = [];
}

// MongoDB database context providing typed collections.
public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    public IMongoCollection<GeoObjectDocument> GeoObjects { get; }
    public IMongoCollection<PolygonDocument> Polygons { get; }

    public MongoDbContext(IOptions<MongoDbOptions> options, IMongoClient client)
    {
        _database = client.GetDatabase(options.Value.DatabaseName);
        GeoObjects = _database.GetCollection<GeoObjectDocument>(options.Value.ObjectsCollectionName);
        Polygons = _database.GetCollection<PolygonDocument>(options.Value.PolygonsCollectionName);
    }

}
