using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.DTOs;
using Practice_team06.DTOs.Actor;

namespace Practice_team06.Services;

public class ActorService : IActorService
{
    private readonly PostgresContext _context;

    public ActorService(PostgresContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ActorDto>> GetAllAsync(string? search = null, string? sortBy = null, bool isDescending = false)
    {
        // 1. Починаємо формувати запит до таблиці Actors
        var query = _context.Actors.AsQueryable();

        // 2. Пошук (Filtering)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(a => a.FirstName.ToLower().Contains(s) 
                                  || a.LastName.ToLower().Contains(s));
        }

        // 3. Сортування (Sorting)
        if (!string.IsNullOrWhiteSpace(sortBy))
        {
            query = sortBy.ToLower() switch
            {
                "firstname" => isDescending ? query.OrderByDescending(a => a.FirstName) : query.OrderBy(a => a.FirstName),
                "lastname"  => isDescending ? query.OrderByDescending(a => a.LastName) : query.OrderBy(a => a.LastName),
                "id"        => isDescending ? query.OrderByDescending(a => a.Id) : query.OrderBy(a => a.Id),
                _           => query.OrderBy(a => a.Id) // за замовчуванням
            };
        }
        else
        {
            query = query.OrderBy(a => a.Id);
        }

        // 4. Перетворення в DTO та виконання запиту
        return await query
            .Select(a => new ActorDto
            {
                Id = a.Id,
                FirstName = a.FirstName,
                LastName = a.LastName,
                PhotoUri = a.PhotoUri
            })
            .ToListAsync();
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
}