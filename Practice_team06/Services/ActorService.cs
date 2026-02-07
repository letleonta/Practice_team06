using AutoMapper;
using AutoMapper.QueryableExtensions; 
using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.DTOs.Actor;
using Practice_team06.DTOs.Common;
using Practice_team06.Extensions;

namespace Practice_team06.Services;

public class ActorService : IActorService
{
    private readonly PostgresContext _context;
    private readonly IMapper _mapper; 

    public ActorService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
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
            .ProjectTo<ActorDto>(_mapper.ConfigurationProvider)
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
        
        return _mapper.Map<ActorDto>(actor);
    }

    public async Task<ActorDto> CreateAsync(CreateActorDto actorDto)
    {
        var actor = _mapper.Map<Actor>(actorDto);

        _context.Actors.Add(actor);
        await _context.SaveChangesAsync();
        
        return _mapper.Map<ActorDto>(actor);
    }

    public async Task<IEnumerable<ActorDto>> CreateRangeAsync(IEnumerable<CreateActorDto> actorsDto)
    {
        var actors = _mapper.Map<List<Actor>>(actorsDto);

        await _context.Actors.AddRangeAsync(actors);
        await _context.SaveChangesAsync();
        
        return _mapper.Map<IEnumerable<ActorDto>>(actors);
    }

    public async Task<bool> UpdateAsync(int id, CreateActorDto actorDto)
    {
        var actor = await _context.Actors.FindAsync(id);
        if (actor == null) return false;
        
        _mapper.Map(actorDto, actor);

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
    
    public async Task<PagedResult<ActorMovieDto>> GetActorMoviesAsync(int actorId, BaseFilterDto filter)
    {
        var query = _context.MovieActors
            .Where(ma => ma.ActorId == actorId)
            .AsQueryable();

        var totalCount = await query.CountAsync();
        
        query = query.OrderByDescending(ma => ma.Movie.ReleaseDate);
        
        query = query.ApplyPagination(filter);

        var items = await query
            .ProjectTo<ActorMovieDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new PagedResult<ActorMovieDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 4
        };
    }
    private static IQueryable<Actor> ApplySorting(IQueryable<Actor> query, string? sortBy, bool isDescending)
    {
        if (string.IsNullOrWhiteSpace(sortBy)) return query.OrderBy(a => a.Id);
        
        return sortBy.ToLower() switch
        {
            "firstname" => isDescending ? query.OrderByDescending(a => a.FirstName) : query.OrderBy(a => a.FirstName),
            "lastname" => isDescending ? query.OrderByDescending(a => a.LastName) : query.OrderBy(a => a.LastName),
            "id" => isDescending ? query.OrderByDescending(a => a.Id) : query.OrderBy(a => a.Id),
            _ => query.OrderBy(a => a.Id)
        };
    }
}