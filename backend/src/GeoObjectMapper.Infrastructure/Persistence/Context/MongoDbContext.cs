using GeoObjectMapper.Infrastructure.Options;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace GeoObjectMapper.Infrastructure.Persistence.Context;

[BsonIgnoreExtraElements]
public class GeoObjectDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("symbolType")]
    public string SymbolType { get; set; } = string.Empty;

    [BsonElement("geometry")]
    public GeoJsonPointDocument Geometry { get; set; } = new();

    [BsonElement("timestamp")]
    public DateTime Timestamp { get; set; }
}

public class GeoJsonPointDocument
{
    [BsonElement("type")]
    public string Type { get; set; } = "Point";

    [BsonElement("coordinates")]
    public double[] Coordinates { get; set; } = []; // [longitude, latitude]
}

[BsonIgnoreExtraElements]
public class PolygonDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("color")]
    public string? Color { get; set; }

    [BsonElement("geometry")]
    public GeoJsonPolygonDocument Geometry { get; set; } = new();

    [BsonElement("timestamp")]
    public DateTime Timestamp { get; set; }
}

public class GeoJsonPolygonDocument
{
    [BsonElement("type")]
    public string Type { get; set; } = "Polygon";

    [BsonElement("coordinates")]
    public double[][][] Coordinates { get; set; } = [];
}

public sealed class MongoDbContext : IMongoDbContext
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
