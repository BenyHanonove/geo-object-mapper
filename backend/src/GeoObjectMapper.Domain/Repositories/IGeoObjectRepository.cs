using GeoObjectMapper.Domain.Entities;

namespace GeoObjectMapper.Domain.Repositories;

// Repository interface for geo object persistence.
public interface IGeoObjectRepository
{
    Task<GeoObject?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<GeoObject>> GetAllAsync(CancellationToken cancellationToken = default);

    Task AddAsync(GeoObject geoObject, CancellationToken cancellationToken = default);

    Task AddRangeAsync(IEnumerable<GeoObject> geoObjects, CancellationToken cancellationToken = default);

    // Returns false when the stored version no longer matches expectedTimestamp.
    Task<bool> UpdateAsync(GeoObject geoObject, DateTime expectedTimestamp, CancellationToken cancellationToken = default);

    Task DeleteAsync(GeoObject geoObject, CancellationToken cancellationToken = default);

    Task DeleteAllAsync(CancellationToken cancellationToken = default);
}
