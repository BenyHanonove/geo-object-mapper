using GeoObjectMapper.Infrastructure.Persistence.Context;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace GeoObjectMapper.Infrastructure.Persistence.Configurations;

public sealed class MongoIndexInitializer : BackgroundService
{
    private readonly IMongoDbContext _context;
    private readonly ILogger<MongoIndexInitializer> _logger;

    public MongoIndexInitializer(IMongoDbContext context, ILogger<MongoIndexInitializer> logger)
    {
        _context = context;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var delaySeconds = 2;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var geoIndexKeys = Builders<GeoObjectDocument>.IndexKeys.Geo2DSphere(x => x.Geometry);
                await _context.GeoObjects.Indexes.CreateOneAsync(
                    new CreateIndexModel<GeoObjectDocument>(geoIndexKeys),
                    cancellationToken: stoppingToken);

                var polyIndexKeys = Builders<PolygonDocument>.IndexKeys.Geo2DSphere(x => x.Geometry);
                await _context.Polygons.Indexes.CreateOneAsync(
                    new CreateIndexModel<PolygonDocument>(polyIndexKeys),
                    cancellationToken: stoppingToken);

                return;
            }
            catch (Exception exception) when (exception is MongoConnectionException or TimeoutException)
            {
                _logger.LogWarning(
                    exception,
                    "MongoDB unavailable while ensuring 2dsphere indexes; retrying in {DelaySeconds}s.",
                    delaySeconds);

                await Task.Delay(TimeSpan.FromSeconds(delaySeconds), stoppingToken);
                delaySeconds = Math.Min(delaySeconds * 2, 30);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
            catch (Exception exception)
            {
                _logger.LogCritical(exception, "Fatal error creating MongoDB 2dsphere indexes.");
                throw;
            }
        }
    }
}
