using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Booking;

public class BookingFilterDto
{
    public BookingStatus? Status { get; set; }
    
    [DataType(DataType.DateTime)]
    public DateTime? BookingFromDate { get; set; }
    [DataType(DataType.DateTime)]
    public DateTime? BookingToDate { get; set; }
    
    [DataType(DataType.DateTime)]
    public DateTime? SessionFromDate { get; set; }
    [DataType(DataType.DateTime)]
    public DateTime? SessionToDate { get; set; }
    
    public int? UserId { get; set; }
    public int? SessionId { get; set; }
    
    public string? SortBy { get; set; }       // "date", "status", "user"
    public bool? IsDescending { get; set; }
}