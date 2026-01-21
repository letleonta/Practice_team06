using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.DTOs;

namespace Practice_team06.Services;

public class ActorService : IActorService
{
    private readonly PostgresContext _context;

    public ActorService(PostgresContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ActorDto>> GetAllAsync()
    {
        return await _context.Actors
            .Select(a => new ActorDto
            {
                Id = a.Id,
                FirstName = a.FirstName,
                LastName = a.LastName,
                PhotoUri = a.PhotoUri
            }).ToListAsync();
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
}