using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Director;
using Practice_team06.Extensions;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class DirectorService : IDirectorService
{
    private readonly PostgresContext _context;
    private readonly IMapper _mapper; 

    public DirectorService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResult<DirectorDto>> GetAllAsync(DirectorFilterDto filter)
    {
        var query = _context.Directors.AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLower();
            query = query.Where(d => d.FirstName.ToLower().Contains(s) 
                                     || d.LastName.ToLower().Contains(s));
        }
        
        var totalCount = await query.CountAsync();
        
        query = ApplySorting(query, filter.SortBy, filter.IsDescending);
        query = query.ApplyPagination(filter);
        
        var items = await query
            .ProjectTo<DirectorDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
        
        return new PagedResult<DirectorDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 6
        };
    }

    public async Task<DirectorDto?> GetByIdAsync(int id)
    {
        var director = await _context.Directors.FindAsync(id);
        if (director == null) return null;

        return _mapper.Map<DirectorDto>(director);
    }

    public async Task<DirectorDto?> CreateAsync(CreateDirectorDto directorDto)
    {
        var director = _mapper.Map<Director>(directorDto);

        _context.Directors.Add(director);
        await _context.SaveChangesAsync();

        return _mapper.Map<DirectorDto>(director);
    }

    public async Task<IEnumerable<DirectorDto>> CreateRangeAsync(IEnumerable<CreateDirectorDto> directorsDto)
    {
        var directors = _mapper.Map<List<Director>>(directorsDto);
        
        await _context.Directors.AddRangeAsync(directors);
        await _context.SaveChangesAsync();
        
        return _mapper.Map<IEnumerable<DirectorDto>>(directors);
    }

    public async Task<bool> UpdateAsync(int id, CreateDirectorDto directorDto)
    {
        var director = await _context.Directors.FindAsync(id);
        if (director == null) return false;
        
        _mapper.Map(directorDto, director);

        await _context.SaveChangesAsync();
        return true;
    }
    
    public async Task<bool> DeleteAsync(int id)
    {
        var director = await _context.Directors.FindAsync(id);
        if (director == null) return false;

        _context.Directors.Remove(director);
        await _context.SaveChangesAsync();
        return true;
    }
    
    public async Task<IEnumerable<DirectorMovieDto>> GetDirectorMoviesAsync(int directorId)
    {
        return await _context.Movies
            .Where(m => m.DirectorId == directorId)
            .ProjectTo<DirectorMovieDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }
    
    private static IQueryable<Director> ApplySorting(IQueryable<Director> query, string? sortBy, bool isDescending)
    {
        if (string.IsNullOrWhiteSpace(sortBy)) return query.OrderBy(d => d.Id);

        return sortBy.ToLower() switch
        {
            "firstname" => isDescending ? query.OrderByDescending(d => d.FirstName) : query.OrderBy(d => d.FirstName),
            "lastname"  => isDescending ? query.OrderByDescending(d => d.LastName) : query.OrderBy(d => d.LastName),
            "id"        => isDescending ? query.OrderByDescending(d => d.Id) : query.OrderBy(d => d.Id),
            _           => query.OrderBy(d => d.Id) 
        };
    }
}