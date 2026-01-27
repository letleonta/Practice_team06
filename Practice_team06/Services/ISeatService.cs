using Practice_team06.DTOs.Seat;

namespace Practice_team06.Services;

public interface ISeatService
{
    Task<IEnumerable<SeatDto>> GetSeatsByHallAsync(int hallId);
    Task<SeatDto?> GetByIdAsync(int id);
    Task<SeatDto?> UpdateSeatAsync(int id, UpdateSeatDto dto);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<SessionSeatDto>> GetSeatsForSessionAsync(int sessionId);
}