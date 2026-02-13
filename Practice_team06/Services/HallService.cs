using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Common;
using Practice_team06.Models;
using Practice_team06.DTOs.Hall;
using Practice_team06.Extensions;

namespace Practice_team06.Services;

public class HallService : IHallService
{
    private readonly PostgresContext _context;
    private readonly IMapper _mapper;

    public HallService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    
    public async Task<PagedResult<HallDto>> GetAllAsync(int page, int pageSize, string? searchTerm)
    {
        var query = _context.Halls.AsNoTracking();
        
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerSearch = searchTerm.ToLower();
            query = query.Where(h => h.Name.ToLower().Contains(lowerSearch));
        }
        
        var totalCount = await query.CountAsync();
        
        var items = await query
            .OrderBy(h => h.Id) 
            .ApplyPagination(page, pageSize)
            .ProjectTo<HallDto>(_mapper.ConfigurationProvider) 
            .ToListAsync();

        return new PagedResult<HallDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
    
    public async Task<HallDto?> GetByIdAsync(int id)
    {
        return await _context.Halls
            .AsNoTracking()
            .Where(h => h.Id == id)
            .ProjectTo<HallDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }

    public async Task<HallDto> CreateAsync(CreateHallDto dto)
    {
        if (await _context.Halls.AnyAsync(h => h.Name == dto.Name))
        {
            throw new InvalidOperationException("Зал з такою назвою вже існує.");
        }

        var hall = _mapper.Map<Hall>(dto);
        
        _context.Halls.Add(hall);
        await _context.SaveChangesAsync();
        
        return _mapper.Map<HallDto>(hall);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var hall = await _context.Halls.FindAsync(id);
        if (hall == null) return false;
        
        var linkedSeats = _context.Seats.Where(s => s.HallId == id);
        _context.Seats.RemoveRange(linkedSeats);
        
        var linkedSessions = _context.Sessions.Where(s => s.HallId == id);
        _context.Sessions.RemoveRange(linkedSessions);
        
        _context.Halls.Remove(hall);

        await _context.SaveChangesAsync();
        return true;
    }
    

    public async Task<object> AddRowToHallAsync(int hallId, RowConfigDto rowConfig)
    {
        var hall = await _context.Halls.FindAsync(hallId);
        if (hall == null) return 0;
        
        var rowExists = await _context.Seats.AnyAsync(s => s.HallId == hallId && s.RowNumber == rowConfig.RowNumber);
        if (rowExists) throw new InvalidOperationException($"Ряд №{rowConfig.RowNumber} вже існує у цьому залі.");

        var seatsToAdd = new List<Seat>();

        for (short s = 1; s <= rowConfig.SeatCount; s++)
        {
            seatsToAdd.Add(new Seat
            {
                HallId = hallId,
                RowNumber = rowConfig.RowNumber,
                SeatNumber = s,
                PriceModifier = rowConfig.Type == SeatType.VIP ? 1.5m : 1.0m,
                SeatType = rowConfig.Type,
            });
        }

        await _context.Seats.AddRangeAsync(seatsToAdd);
        await _context.SaveChangesAsync();
        return seatsToAdd.Count;
    }
}