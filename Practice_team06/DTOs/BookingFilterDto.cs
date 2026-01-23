using Practice_team06.Models;

namespace Practice_team06.DTOs;

public class BookingFilterDto
{
    public BookingStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int? UserId { get; set; }
    public int? SessionId { get; set; }
    
    public string? SortBy { get; set; }       // "date", "status", "user", "session"
    public string? SortOrder { get; set; }    // "asc" | "desc"
}