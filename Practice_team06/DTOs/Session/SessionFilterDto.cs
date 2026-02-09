using Practice_team06.DTOs.Common;

namespace Practice_team06.DTOs.Session;

public class SessionFilterDto : BaseFilterDto
{
    public int? MovieId { get; set; }
    public int? HallId { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public bool? IsActive { get; set; }
}