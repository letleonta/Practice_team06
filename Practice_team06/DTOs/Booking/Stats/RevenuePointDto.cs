using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Booking.Stats;

public class RevenuePointDto
{
    [DataType(DataType.Date)]
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
}