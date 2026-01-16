using System;
using System.Collections.Generic;

namespace Practice_team06.Models;

public partial class Customer
{
    public int Id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public string Password { get; set; } = null!;

    public DateTime? BirthDate { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
