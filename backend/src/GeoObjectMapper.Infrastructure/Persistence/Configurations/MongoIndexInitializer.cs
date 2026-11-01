using GeoObjectMapper.Infrastructure.Persistence.Context;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace GeoObjectMapper.Infrastructure.Persistence.Configurations;

// Creates the 2dsphere indexes on startup without blocking requests.
public sealed class MongoIndexInitializer : BackgroundService
{
    private readonly MongoDbContext _context;
    private readonly ILogger<MongoIndexInitializer> _logger;

    public MongoIndexInitializer(MongoDbContext context, ILogger<MongoIndexInitializer> logger)
    {
        _context = context;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            var geoIndexKeys = Builders<GeoObjectDocument>.IndexKeys.Geo2DSphere("Geometry");
            await _context.GeoObjects.Indexes.CreateOneAsync(
                new CreateIndexModel<GeoObjectDocument>(geoIndexKeys),
                cancellationToken: stoppingToken);

            var polyIndexKeys = Builders<PolygonDocument>.IndexKeys.Geo2DSphere("Geometry");
            await _context.Polygons.Indexes.CreateOneAsync(
                new CreateIndexModel<PolygonDocument>(polyIndexKeys),
                cancellationToken: stoppingToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogError(exception, "Failed to create MongoDB indexes.");
        }
    }
}
