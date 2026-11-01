using GeoObjectMapper.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace GeoObjectMapper.Api.Controllers;

// Shared base translating Result errors into ProblemDetails responses.
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult Failure(Error error)
    {
        var statusCode = error.Code switch
        {
            "Conflict.VersionMismatch" => StatusCodes.Status409Conflict,
            var code when code.EndsWith(".NotFound") => StatusCodes.Status404NotFound,
            _ => StatusCodes.Status400BadRequest
        };

        return Problem(detail: error.Description, instance: Request.Path, statusCode: statusCode);
    }
}
