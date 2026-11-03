using GeoObjectMapper.Application.Features.Polygons.Commands;
using GeoObjectMapper.Domain.Entities;
using GeoObjectMapper.Domain.Repositories;
using GeoObjectMapper.Domain.ValueObjects;

namespace GeoObjectMapper.UnitTests;

public class UpdatePolygonCommandHandlerTests
{
    private readonly Polygon _polygon = Polygon.Create("Original", null, PolygonGeometry.FromRing(
    [
        new Coordinate(0, 0),
        new Coordinate(0, 1),
        new Coordinate(1, 1),
        new Coordinate(0, 0)
    ]));

    private string CurrentTimestamp => _polygon.Timestamp.ToString("o");

    private static Task<Application.Common.Models.Result<Application.DTOs.PolygonDto>> Rename(
        InMemoryPolygonRepository repository,
        Guid id,
        string timestamp) =>
        new UpdatePolygonCommandHandler(repository).Handle(
            new UpdatePolygonCommand(id, "Renamed", null, null, timestamp),
            CancellationToken.None);

    [Fact]
    public async Task Updates_when_the_timestamp_matches()
    {
        var result = await Rename(new InMemoryPolygonRepository(_polygon), _polygon.Id, CurrentTimestamp);

        Assert.True(result.IsSuccess);
        Assert.Equal("Renamed", result.Value.Name);
    }

    [Fact]
    public async Task Returns_conflict_when_the_timestamp_is_stale()
    {
        var repository = new InMemoryPolygonRepository(_polygon);

        var result = await Rename(repository, _polygon.Id, "2000-01-01T00:00:00.0000000Z");

        Assert.Equal("Conflict.VersionMismatch", result.Error.Code);
        Assert.False(repository.WasUpdated);
    }

    [Fact]
    public async Task Returns_conflict_when_another_write_wins_the_race()
    {
        var repository = new InMemoryPolygonRepository(
            _polygon,
            onBeforeUpdate: stored => stored.SetTimestamp(stored.Timestamp.AddSeconds(5)));

        var result = await Rename(repository, _polygon.Id, CurrentTimestamp);

        Assert.Equal("Conflict.VersionMismatch", result.Error.Code);
    }

    [Fact]
    public async Task Returns_not_found_for_a_missing_polygon()
    {
        var result = await Rename(new InMemoryPolygonRepository(_polygon), Guid.NewGuid(), CurrentTimestamp);

        Assert.EndsWith(".NotFound", result.Error.Code);
    }

    private sealed class InMemoryPolygonRepository : IPolygonRepository
    {
        private readonly Dictionary<Guid, Polygon> _store = new();
        private readonly Action<Polygon>? _onBeforeUpdate;

        public bool WasUpdated { get; private set; }

        public InMemoryPolygonRepository(Polygon seed, Action<Polygon>? onBeforeUpdate = null)
        {
            _store[seed.Id] = Clone(seed);
            _onBeforeUpdate = onBeforeUpdate;
        }

        public Task<Polygon?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            Task.FromResult(_store.TryGetValue(id, out var existing) ? Clone(existing) : null);

        public Task<bool> UpdateAsync(Polygon entity, DateTime expectedTimestamp, CancellationToken cancellationToken = default)
        {
            if (!_store.TryGetValue(entity.Id, out var stored))
            {
                return Task.FromResult(false);
            }

            _onBeforeUpdate?.Invoke(stored);

            if (stored.Timestamp != expectedTimestamp)
            {
                WasUpdated = false;
                return Task.FromResult(false);
            }

            _store[entity.Id] = Clone(entity);
            WasUpdated = true;
            return Task.FromResult(true);
        }

        public Task<IReadOnlyList<Polygon>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Polygon>>(_store.Values.Select(Clone).ToList());

        public Task AddAsync(Polygon entity, CancellationToken cancellationToken = default)
        {
            _store[entity.Id] = Clone(entity);
            return Task.CompletedTask;
        }

        public Task AddRangeAsync(IEnumerable<Polygon> entities, CancellationToken cancellationToken = default)
        {
            foreach (var entity in entities)
            {
                _store[entity.Id] = Clone(entity);
            }
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Polygon entity, CancellationToken cancellationToken = default)
        {
            _store.Remove(entity.Id);
            return Task.CompletedTask;
        }

        public Task DeleteAllAsync(CancellationToken cancellationToken = default)
        {
            _store.Clear();
            return Task.CompletedTask;
        }

        private static Polygon Clone(Polygon source)
        {
            var copy = Polygon.Create(source.Name, source.Color, source.Geometry, source.Id);
            copy.SetTimestamp(source.Timestamp);
            return copy;
        }
    }
}
