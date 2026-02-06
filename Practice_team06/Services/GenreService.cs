using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.DTOs.Genre;

namespace Practice_team06.Services;

public class GenreService : IGenreService
{
    private readonly PostgresContext _context;
    private readonly IMapper _mapper;

    public GenreService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<GenreDto>> GetAllAsync(string? search = null, string? sortBy = null,
        bool isDescending = false)
    {
        var query = _context.Genres.AsNoTracking();

        // 1. Пошук
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(g => g.Name.ToLower().Contains(s));
        }

        // 2. Сортування
        query = !string.IsNullOrWhiteSpace(sortBy) && sortBy.ToLower() == "name" 
            ? (isDescending ? query.OrderByDescending(g => g.Name) : query.OrderBy(g => g.Name))
            : (isDescending ? query.OrderByDescending(g => g.Id) : query.OrderBy(g => g.Id));

        return await query
            .ProjectTo<GenreDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<GenreDto?> GetByIdAsync(int id)
    {
        return await _context.Genres
            .AsNoTracking()
            .Where(g => g.Id == id)
            .ProjectTo<GenreDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }

    public async Task<GenreDto> CreateAsync(CreateGenreDto genreDto)
    {
        var genre = _mapper.Map<Genre>(genreDto);

        _context.Genres.Add(genre);
        await _context.SaveChangesAsync();

        return _mapper.Map<GenreDto>(genre);
    }

    public async Task<IEnumerable<GenreDto>> CreateRangeAsync(IEnumerable<CreateGenreDto> genresDto)
    {
        var genres = _mapper.Map<List<Genre>>(genresDto);

        await _context.Genres.AddRangeAsync(genres);
        await _context.SaveChangesAsync();

        return _mapper.Map<IEnumerable<GenreDto>>(genres);
    }

    public async Task<bool> UpdateAsync(int id, CreateGenreDto genreDto)
    {
        var genre = await _context.Genres.FindAsync(id);
        if (genre == null) return false;

        _mapper.Map(genreDto, genre);
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var genre = await _context.Genres.FindAsync(id);
        if (genre == null) return false;

        _context.Genres.Remove(genre);
        await _context.SaveChangesAsync();

        return true;
    }
}