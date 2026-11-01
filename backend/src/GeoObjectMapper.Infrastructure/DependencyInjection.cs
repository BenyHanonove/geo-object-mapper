using GeoObjectMapper.Domain.Repositories;
using GeoObjectMapper.Infrastructure.Options;
using GeoObjectMapper.Infrastructure.Persistence.Configurations;
using GeoObjectMapper.Infrastructure.Persistence.Context;
using GeoObjectMapper.Infrastructure.Persistence.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace GeoObjectMapper.Infrastructure;

// Dependency Injection extension for Infrastructure layer.
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Strongly-typed options with fail-fast startup validation
        services.AddOptions<MongoDbOptions>()
            .Bind(configuration.GetSection(MongoDbOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        // 2. MongoDB client singleton
        services.AddSingleton<IMongoClient>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<MongoDbOptions>>().Value;
            var settings = MongoClientSettings.FromConnectionString(options.ConnectionString);
            settings.ServerSelectionTimeout = TimeSpan.FromSeconds(options.ServerSelectionTimeoutSeconds);
            return new MongoClient(settings);
        });

        // 3. Database context
        services.AddSingleton<MongoDbContext>();

        // 4. Spatial indexes created in the background
        services.AddHostedService<MongoIndexInitializer>();

        // 5. Repositories
        services.AddScoped<IGeoObjectRepository, MongoGeoObjectRepository>();
        services.AddScoped<IPolygonRepository, MongoPolygonRepository>();

        return services;
    }
}
