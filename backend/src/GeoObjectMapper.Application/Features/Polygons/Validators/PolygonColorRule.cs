namespace GeoObjectMapper.Application.Features.Polygons.Validators;

// Polygon color format shared by create and update validators. Empty clears the color.
public static class PolygonColorRule
{
    public const string Pattern = "^(#[0-9a-fA-F]{6})?$";
    public const string Message = "Color must be a hex value such as #2563eb.";
}
