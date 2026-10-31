using FluentValidation;
using GeoObjectMapper.Application.Common.Mappings;
using GeoObjectMapper.Application.Common.Models;
using GeoObjectMapper.Application.DTOs;
using GeoObjectMapper.Application.Features.Polygons.Validators;
using GeoObjectMapper.Domain.Repositories;
using MediatR;

namespace GeoObjectMapper.Application.Features.Polygons.Commands;

// CQRS command to update a Polygon with optimistic concurrency.
public sealed record class UpdatePolygonCommand(
    Guid Id,
    string? Name,
    string? Color,
    PolygonGeometryDto? Geometry,
    string Timestamp) : IRequest<Result<PolygonDto>>;

// Validator for UpdatePolygonCommand.
public sealed class UpdatePolygonCommandValidator : AbstractValidator<UpdatePolygonCommand>
{
    public UpdatePolygonCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();

        RuleFor(x => x.Timestamp)
            .NotEmpty();

        When(x => x.Name != null, () =>
        {
            RuleFor(x => x.Name!)
                .NotEmpty()
                .MaximumLength(100);
        });

        RuleFor(x => x.Color)
            .Matches(PolygonColorRule.Pattern)
            .WithMessage(PolygonColorRule.Message);

        When(x => x.Geometry != null, () =>
        {
            RuleFor(x => x.Geometry!)
                .SetValidator(new PolygonGeometryDtoValidator());
        });
    }
}

// Command handler updating the Polygon with timestamp check.
public sealed class UpdatePolygonCommandHandler : IRequestHandler<UpdatePolygonCommand, Result<PolygonDto>>
{
    private readonly IPolygonRepository _repository;

    public UpdatePolygonCommandHandler(IPolygonRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PolygonDto>> Handle(
        UpdatePolygonCommand request,
        CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Error.NotFound("Polygon", request.Id);
        }

        if (entity.Timestamp.ToString("o") != request.Timestamp)
        {
            return Error.Conflict("Polygon was modified elsewhere. Loaded latest version.");
        }

        var expectedTimestamp = entity.Timestamp;
        var geometry = request.Geometry?.ToDomain();
        entity.Update(request.Name, request.Color, geometry);

        var updated = await _repository.UpdateAsync(entity, expectedTimestamp, cancellationToken);
        if (!updated)
        {
            return Error.Conflict("Polygon was modified elsewhere. Loaded latest version.");
        }

        return Result.Success(entity.ToDto());
    }
}
