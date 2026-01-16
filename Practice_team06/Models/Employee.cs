using System;
using System.Collections.Generic;

namespace Practice_team06.Models;

public partial class Employee
{
    public int Id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? Role { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;
}
