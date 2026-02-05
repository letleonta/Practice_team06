using Practice_team06.DTOs.Common;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Movie;

public class MovieFilterDto : BaseFilterDto
{
    public string? Title { get; set; } = null!;
    public decimal? Rating { get; set; }
    public SelectionType? SelectionType { get; set; }
    public List<AgeRestriction> AgeRestrictions  { get; set; } = new();
    public List<string> Genres { get; set; } = new();
}

public enum SelectionType
{
    NowPlaying = 0,
    Upcoming = 1
}