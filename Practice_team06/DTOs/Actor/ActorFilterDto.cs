using Practice_team06.DTOs.Common;

namespace Practice_team06.DTOs.Actor; 

public class ActorFilterDto : BaseFilterDto
{
    public string? Search { get; set; }
    
    public string? SortBy { get; set; } // "firstname", "lastname"
   
    public bool IsDescending { get; set; } = false; 
}