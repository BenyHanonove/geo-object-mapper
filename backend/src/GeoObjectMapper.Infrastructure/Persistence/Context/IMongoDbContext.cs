using MongoDB.Driver;

namespace GeoObjectMapper.Infrastructure.Persistence.Context;

public interface IMongoDbContext
{
    IMongoCollection<GeoObjectDocument> GeoObjects { get; }
    IMongoCollection<PolygonDocument> Polygons { get; }
}
