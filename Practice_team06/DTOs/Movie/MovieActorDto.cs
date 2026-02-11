using Practice_team06.DTOs.Actor; 

namespace Practice_team06.DTOs.Movie;

public class MovieActorDto
{
    public int ActorId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public ActorDto Actor { get; set; } = null!;
}