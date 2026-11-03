# Backend

ASP.NET Core 8 REST API that stores polygons and objects in MongoDB as GeoJSON.

## Layers

| Project | Responsibility |
|---|---|
| `GeoObjectMapper.Domain` | Entities, value objects, geometry rules and repository interfaces (`IPolygonRepository`, `IGeoObjectRepository`) |
| `GeoObjectMapper.Application` | `ICommand`/`IQuery` contracts, handlers, validators, DTOs and the `Result` type |
| `GeoObjectMapper.Infrastructure` | `IMongoDbContext`, MongoDB repositories, `2dsphere` index initializer and health check |
| `GeoObjectMapper.Api` | Controllers, middleware, Swagger and startup |

Domain depends on nothing. Application depends on Domain. Infrastructure implements the Domain interfaces, and Api wires everything together.

## Request flow

A controller sends an `ICommand` or `IQuery` through MediatR. The pipeline logs the request and runs FluentValidation before the handler. Handlers return a `Result`, and `ApiControllerBase` turns failures into `ProblemDetails` (or `ValidationProblemDetails` with field-level errors on validation failure). Unexpected exceptions are handled by `GlobalExceptionHandlerMiddleware`.

## Configuration

Settings live in `appsettings.json` under `MongoDB` and are validated on startup. Environment variables override them, for example `MongoDB__ConnectionString`. A local `backend/.env` is loaded when present, and `.env.example` shows the format. `MongoDB__ServerSelectionTimeoutSeconds` controls how long a request waits for the database before the API returns a 503, and defaults to 5.

## Commands

```bash
dotnet build
```

```bash
dotnet test
```

```bash
dotnet run --project src/GeoObjectMapper.Api
```
