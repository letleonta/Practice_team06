using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Ticket;

public class TicketDto
{
    [Required]
    public int Id { get; set; }
    public string? MovieTitle { get; set; }
    [Url]
    public string? MoviePoster { get; set; }
    public DateTime StartTime { get; set; }
    public AgeRestriction AgeRestriction { get; set; }
    [Required]
    [Range(0, 1000000)]
    public decimal ActualPrice { get; set; }
    [Required]
    public bool IsActive { get; set; } = true;
    public string? HallName { get; set; }
    public short? RowNumber { get; set; }
    public short? SeatNumber { get; set; }
}