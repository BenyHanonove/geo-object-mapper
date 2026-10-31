using GeoObjectMapper.Domain.Entities;

namespace GeoObjectMapper.Domain.Repositories;

// Repository interface for polygon persistence.
public interface IPolygonRepository
{
    Task<Polygon?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Polygon>> GetAllAsync(CancellationToken cancellationToken = default);

    Task AddAsync(Polygon polygon, CancellationToken cancellationToken = default);

    Task AddRangeAsync(IEnumerable<Polygon> polygons, CancellationToken cancellationToken = default);

    // Returns false when the stored version no longer matches expectedTimestamp.
    Task<bool> UpdateAsync(Polygon polygon, DateTime expectedTimestamp, CancellationToken cancellationToken = default);

    Task DeleteAsync(Polygon polygon, CancellationToken cancellationToken = default);

    Task DeleteAllAsync(CancellationToken cancellationToken = default);
}
