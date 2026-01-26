using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.DTOs;
using Practice_team06.DTOs.Hall;

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

    public async Task<bool> DeleteAsync(short id)
    {
        var hall = await _context.Halls.FindAsync(id);
        if (hall == null) return false;
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
        var hall = await _context.Halls.FindAsync(dto.HallId);
        if (hall == null) return 0;
        
        var oldSeats = _context.Seats.Where(s => s.HallId == dto.HallId);
        _context.Seats.RemoveRange(oldSeats);

        var seatsToCreate = new List<Seat>();

        foreach (var rowConfig in dto.Rows)
        {
            for (short s = 1; s <= rowConfig.SeatCount; s++)
            {
                seatsToCreate.Add(new Seat
                {
                    HallId = dto.HallId,
                    RowNumber = rowConfig.RowNumber,
                    SeatNumber = s,
                    PriceModifier = rowConfig.Type == SeatType.VIP ? 1.5m : 1.0m,
                    SeatType = rowConfig.Type,
                });
            }
        }

        await _context.Seats.AddRangeAsync(seatsToCreate);
        await _context.SaveChangesAsync();
        return seatsToCreate.Count;
    }
}