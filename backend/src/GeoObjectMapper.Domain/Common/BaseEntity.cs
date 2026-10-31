namespace GeoObjectMapper.Domain.Common;


// Base type holding identity and the version timestamp.
public abstract class BaseEntity
{
    public Guid Id { get; protected set; }
    public DateTime Timestamp { get; protected set; }


    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        Timestamp = ToMilliseconds(DateTime.UtcNow);
    }

    protected BaseEntity(Guid id, DateTime timestamp)
    {
        Id = id;
        Timestamp = ToMilliseconds(timestamp);
    }

    public void SetTimestamp(DateTime timestamp)
    {
        Timestamp = ToMilliseconds(timestamp);
    }

    private static DateTime ToMilliseconds(DateTime value) =>
        new(value.Ticks - value.Ticks % TimeSpan.TicksPerMillisecond, value.Kind);

}
