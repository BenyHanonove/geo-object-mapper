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

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<MongoDbOptions>()
            .Bind(configuration.GetSection(MongoDbOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<IMongoClient>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<MongoDbOptions>>().Value;
            var settings = MongoClientSettings.FromConnectionString(options.ConnectionString);
            settings.ServerSelectionTimeout = TimeSpan.FromSeconds(options.ServerSelectionTimeoutSeconds);
            return new MongoClient(settings);
        });

        services.AddSingleton<IMongoDbContext, MongoDbContext>();
        services.AddHostedService<MongoIndexInitializer>();

        services.AddScoped<IGeoObjectRepository, MongoGeoObjectRepository>();
        services.AddScoped<IPolygonRepository, MongoPolygonRepository>();

        return services;
    }
}
