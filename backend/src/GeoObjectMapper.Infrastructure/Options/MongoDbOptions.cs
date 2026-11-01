using System.ComponentModel.DataAnnotations;

namespace GeoObjectMapper.Infrastructure.Options;

// Strongly-typed options for MongoDB connection.
public sealed class MongoDbOptions
{
    public const string SectionName = "MongoDB";
    [Required(ErrorMessage = "MongoDB connection string is required.")]
    public string ConnectionString { get; init; } = "mongodb://localhost:27017";
    [Required(ErrorMessage = "Database name is required.")]
    public string DatabaseName { get; init; } = "GeoObjectMapperDb";
    public string ObjectsCollectionName { get; init; } = "geo_objects";
    public string PolygonsCollectionName { get; init; } = "polygons";
    [Range(1, 60, ErrorMessage = "Server selection timeout must be between 1 and 60 seconds.")]
    public int ServerSelectionTimeoutSeconds { get; init; } = 5;
}
