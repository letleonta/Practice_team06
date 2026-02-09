using Practice_team06.DTOs.Common;

namespace Practice_team06.DTOs.Genre;

public class GenreFilterDto : BaseFilterDto
{
    public string? Search { get; set; }

    public string? SortBy { get; set; } // "name", "id"

    public bool IsDescending { get; set; } = false;
}