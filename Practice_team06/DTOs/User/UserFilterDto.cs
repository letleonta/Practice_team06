using Practice_team06.DTOs.Common;

namespace Practice_team06.DTOs.User;

public class UserFilterDto : BaseFilterDto
{
    public string? Search { get; set; }
    public string? SortBy { get; set; } 
    public bool IsDescending { get; set; } = false;
}