namespace Practice_team06.DTOs.Booking.Stats;

public class BookingsStatsDto
{
    public int TotalCount { get; set; }
    public int InProgressCount { get; set; }
    public int PaidCount { get; set; }
    public int CancelledCount { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalTicketsCount { get; set; }
    public List<RevenuePointDto> RevenuePoints { get; set; } = null!;
    public List<HallPointDto> HallPoints { get; set; } = null!;
    public List<GenrePointDto> GenrePoints { get; set; } = null!;
}