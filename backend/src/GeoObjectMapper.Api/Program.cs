using DotNetEnv;
using GeoObjectMapper.Api.Middlewares;
using GeoObjectMapper.Application;
using GeoObjectMapper.Infrastructure;
using GeoObjectMapper.Infrastructure.HealthChecks;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.OpenApi.Models;

const string readyTag = "ready";

// Load backend/.env when present, without overriding real environment variables
Env.TraversePath().NoClobber().Load();

var builder = WebApplication.CreateBuilder(args);

// 1. Add Controllers & JSON settings
builder.Services.AddControllers();

// 2. Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "GeoObjectMapper API",
        Version = "v1",
        Description = "REST API for managing map polygons and objects stored in MongoDB as GeoJSON."
    });

    options.IncludeXmlComments(
        Path.Combine(AppContext.BaseDirectory, "GeoObjectMapper.Api.xml"),
        includeControllerXmlComments: true);
});

// 3. HealthChecks
builder.Services.AddHealthChecks()
    .AddCheck<MongoHealthCheck>("mongodb", tags: [readyTag], timeout: TimeSpan.FromSeconds(3));

// 4. CORS: Allow React Vite frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// 5. Dependency Injection
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// 6. Middleware Pipeline (Order matters!)
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.MapControllers();
app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = check => check.Tags.Contains(readyTag) });

app.Run();
