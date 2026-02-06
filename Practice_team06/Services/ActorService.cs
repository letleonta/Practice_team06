using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.DTOs.Actor;
using Practice_team06.DTOs.Common;
using Practice_team06.Extensions;

namespace Practice_team06.Services;

public class ActorService : IActorService
{
    private readonly PostgresContext _context;

    public ActorService(PostgresContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ActorDto>> GetAllAsync(ActorFilterDto filter)
    {
        var query = _context.Actors.AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLower();
            query = query.Where(a => a.FirstName.ToLower().Contains(s) 
                                     || a.LastName.ToLower().Contains(s));
        }
        
        var totalCount = await query.CountAsync();
        
        query = ApplySorting(query, filter.SortBy, filter.IsDescending);
        
        query = query.ApplyPagination(filter);
        
        var items = await query
            .Select(a => new ActorDto
            {
                Id = a.Id,
                FirstName = a.FirstName,
                LastName = a.LastName,
                PhotoUri = a.PhotoUri
            })
            .ToListAsync();
        
        return new PagedResult<ActorDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 6
        };
    }
    public async Task<ActorDto?> GetByIdAsync(int id)
    {
        var actor = await _context.Actors.FindAsync(id);
        if (actor == null) return null;

        return new ActorDto
        {
            Id = actor.Id,
            FirstName = actor.FirstName,
            LastName = actor.LastName,
            PhotoUri = actor.PhotoUri
        };
    }

    public async Task<ActorDto> CreateAsync(CreateActorDto actorDto)
    {
        var actor = new Actor
        {
            FirstName = actorDto.FirstName,
            LastName = actorDto.LastName,
            PhotoUri = actorDto.PhotoUri
        };

        _context.Actors.Add(actor);
        await _context.SaveChangesAsync();

        return new ActorDto
        {
            Id = actor.Id,
            FirstName = actor.FirstName,
            LastName = actor.LastName,
            PhotoUri = actor.PhotoUri
        };
    }
    public async Task<IEnumerable<ActorDto>> CreateRangeAsync(IEnumerable<CreateActorDto> actorsDto)
    {
        // 1. Перетворюємо список DTO у список моделей Actor
        var actors = actorsDto.Select(dto => new Actor
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhotoUri = dto.PhotoUri
        }).ToList();

        // 2. Додаємо весь список одним махом
        await _context.Actors.AddRangeAsync(actors);
        await _context.SaveChangesAsync();

        // 3. Повертаємо список створених акторів з їхніми новими ID
        return actors.Select(a => new ActorDto
        {
            Id = a.Id,
            FirstName = a.FirstName,
            LastName = a.LastName,
            PhotoUri = a.PhotoUri
        });
    }
    public async Task<bool> UpdateAsync(int id, CreateActorDto actorDto)
    {
        var actor = await _context.Actors.FindAsync(id);
        if (actor == null) return false;

        actor.FirstName = actorDto.FirstName;
        actor.LastName = actorDto.LastName;
        actor.PhotoUri = actorDto.PhotoUri;

        await _context.SaveChangesAsync();
        return true;
    }
    
    public async Task<bool> DeleteAsync(int id)
    {
        var actor = await _context.Actors.FindAsync(id);
        if (actor == null) return false;

        _context.Actors.Remove(actor);
        await _context.SaveChangesAsync();
        return true;
    }
    
    public async Task<IEnumerable<ActorMovieDto>> GetActorMoviesAsync(int actorId)
    {
        return await _context.MovieActors
            .Where(ma => ma.ActorId == actorId)
            .Select(ma => new ActorMovieDto
            {
                MovieId = ma.MovieId,
                Title = ma.Movie.Title,
                RoleName = ma.RoleName,
                // Пряме присвоєння, типи тепер збігаються (DateOnly? = DateOnly?)
                ReleaseDate = ma.Movie.ReleaseDate 
            })
            .ToListAsync();
    }
    
    private static IQueryable<Actor> ApplySorting(IQueryable<Actor> query, string? sortBy, bool isDescending)
    {
        
        if (string.IsNullOrWhiteSpace(sortBy))
        {
            return query.OrderBy(a => a.Id);
        }
        
        return sortBy.ToLower() switch
        {
            "firstname" => isDescending 
                ? query.OrderByDescending(a => a.FirstName) 
                : query.OrderBy(a => a.FirstName),

            "lastname" => isDescending 
                ? query.OrderByDescending(a => a.LastName) 
                : query.OrderBy(a => a.LastName),

            "id" => isDescending 
                ? query.OrderByDescending(a => a.Id) 
                : query.OrderBy(a => a.Id),
            _ => query.OrderBy(a => a.Id)
        };
    }
}