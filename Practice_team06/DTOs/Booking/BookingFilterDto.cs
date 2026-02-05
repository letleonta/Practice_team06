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
    
    public string? UserEmail { get; set; }
    public int? SessionId { get; set; }
    
    public string? SearchQuery { get; set; }
    
    public string? SortBy { get; set; }       // "date", "status", "useremail"
    public bool? IsDescending { get; set; }
    
    public int? Page { get; set; } = 1;
    [Range(6, 100)]
    public int? PageSize { get; set; } = 10;
}