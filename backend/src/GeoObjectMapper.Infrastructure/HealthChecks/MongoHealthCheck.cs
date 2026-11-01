using GeoObjectMapper.Infrastructure.Options;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace GeoObjectMapper.Infrastructure.HealthChecks;

// Readiness check pinging MongoDB.
public sealed class MongoHealthCheck : IHealthCheck
{
    private readonly IMongoDatabase _database;

    public MongoHealthCheck(IMongoClient client, IOptions<MongoDbOptions> options)
    {
        _database = client.GetDatabase(options.Value.DatabaseName);
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        await _database.RunCommandAsync<BsonDocument>(new BsonDocument("ping", 1), cancellationToken: cancellationToken);
        return HealthCheckResult.Healthy();
    }
}
