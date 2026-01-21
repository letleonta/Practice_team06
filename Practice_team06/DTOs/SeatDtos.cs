using Practice_team06.Models;

namespace Practice_team06.DTOs;

public class SeatDto
{
    public int Id { get; set; }
    public int HallId { get; set; }
    public short RowNumber { get; set; }
    public short SeatNumber { get; set; }
    public decimal? PriceModifier { get; set; }
    public SeatType SeatType { get; set; }
    public SeatStatus SeatStatus { get; set; }
}

public class UpdateSeatDto
{
    public SeatType SeatType { get; set; }
    public SeatStatus SeatStatus { get; set; }
    public decimal? PriceModifier { get; set; }
}