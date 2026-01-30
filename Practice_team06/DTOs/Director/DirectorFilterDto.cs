namespace Practice_team06.DTOs.Director;

public class DirectorFilterDto
{
    public string? Search { get; set; }
    
    public string? SortBy { get; set; } // "firstname", "lastname"
   
    public bool IsDescending { get; set; } = false; 
}