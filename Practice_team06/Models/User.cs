using System;
using System.Collections.Generic;

namespace Practice_team06.Models;

public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string Password { get; set; } = null!;
    public DateTime? BirthDate { get; set; }
    public UserRole Role { get; set; }
    public List<Booking> Bookings { get; set; } = new();
}
public enum UserRole { Client, Admin }