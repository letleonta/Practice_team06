namespace Practice_team06.DTOs.Auth;

public class AuthResultDto
{
    public bool Succeeded { get; set; }
    public LoginResponseDto? Response { get; set; }
    public IEnumerable<string>? Errors { get; set; }
}