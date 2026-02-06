using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Common;
using Practice_team06.Models;
using Practice_team06.DTOs.Hall;
using Practice_team06.Extensions;

namespace Practice_team06.Services;

public class HallService : IHallService
{
    private readonly PostgresContext _context;

    public HallService(PostgresContext context) => _context = context;

    public async Task<IEnumerable<HallDto>> GetAllAsync()
    {
        return await _context.Halls
            .Select(h => new HallDto {
                Id = h.Id,
                Name = h.Name,
                PriceModifier = h.PriceModifier,
                Description = h.Description
            }).ToListAsync();
    }
    
    public async Task<HallDto?> GetByIdAsync(int id)
    {
        var h = await _context.Halls.FindAsync(id);
        if (h == null) return null;
        return new HallDto { Id = h.Id, Name = h.Name, PriceModifier = h.PriceModifier, Description = h.Description };
    }

    public async Task<HallDto> CreateAsync(CreateHallDto dto)
    {
        if (await _context.Halls.AnyAsync(h => h.Name == dto.Name))
        {
            throw new InvalidOperationException("Зал з такою назвою вже існує.");
        }

        var hall = new Hall { Name = dto.Name, PriceModifier = dto.PriceModifier, Description = dto.Description };
        _context.Halls.Add(hall);
        await _context.SaveChangesAsync();
        return new HallDto { Id = hall.Id, Name = hall.Name, PriceModifier = hall.PriceModifier, Description = hall.Description };
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
    public async Task<int> GenerateStandardSeatsAsync(GenerateStandardSeatsDto dto)
    {
        var hall = await _context.Halls.FindAsync(dto.HallId);
        if (hall == null) return 0;
        
        var oldSeats = _context.Seats.Where(s => s.HallId == dto.HallId);
        _context.Seats.RemoveRange(oldSeats);

        var seatsToCreate = new List<Seat>();

        for (short r = 1; r <= dto.RowCount; r++)
        {
            for (short s = 1; s <= dto.SeatsPerRow; s++)
            {
                seatsToCreate.Add(new Seat
                {
                    HallId = dto.HallId,
                    RowNumber = r,
                    SeatNumber = s,
                    PriceModifier = dto.Type == SeatType.VIP ? 1.5m : 1.0m,
                    SeatType = dto.Type,
                });
            }
        }

        await _context.Seats.AddRangeAsync(seatsToCreate);
        await _context.SaveChangesAsync();
        return seatsToCreate.Count;
    }

    public async Task<int> GenerateFlexibleSeatsAsync(GenerateFlexibleSeatsDto dto)
    {
        var hasTickets = await _context.Tickets.AnyAsync(t => t.Seat.HallId == dto.HallId);
    
        if (hasTickets)
        {
            // Викидаємо чітке повідомлення
            throw new InvalidOperationException("Неможливо змінити схему залу: на існуючі місця вже продано квитки.");
        }

        // 2. Якщо квитків немає — видаляємо старі місця
        var oldSeats = _context.Seats.Where(s => s.HallId == dto.HallId);
        _context.Seats.RemoveRange(oldSeats);

        // 3. Створюємо нові
        var seatsToCreate = new List<Seat>();
        foreach (var row in dto.Rows)
        {
            for (short s = 1; s <= row.SeatCount; s++)
            {
                seatsToCreate.Add(new Seat {
                    HallId = dto.HallId,
                    RowNumber = (short)row.RowNumber,
                    SeatNumber = s,
                    PriceModifier = row.Type == SeatType.VIP ? 1.5m : 1.0m,
                    SeatType = row.Type
                });
            }
        }

        await _context.Seats.AddRangeAsync(seatsToCreate);
        await _context.SaveChangesAsync();
        return seatsToCreate.Count;
    }
    public async Task<PagedResult<HallDto>> GetPagedAsync(int page, int pageSize, string searchTerm)
    {
        var query = _context.Halls.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerSearch = searchTerm.ToLower();
            query = query.Where(h => h.Name.ToLower().Contains(lowerSearch));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(h => h.Id)
            .ApplyPagination(page, pageSize) // Твоє розширення
            .Select(h => new HallDto 
            {
                Id = h.Id,
                Name = h.Name,
                PriceModifier = h.PriceModifier,
                Description = h.Description
            })
            .ToListAsync();

        return new PagedResult<HallDto> 
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
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
                RowNumber = (short)rowConfig.RowNumber,
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