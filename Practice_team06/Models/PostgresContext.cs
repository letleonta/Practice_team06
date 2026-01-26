using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Practice_team06.Models;

public partial class PostgresContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    public PostgresContext() { }

    public PostgresContext(DbContextOptions<PostgresContext> options) : base(options) { }

    public virtual DbSet<Actor> Actors { get; set; }
    public virtual DbSet<Booking> Bookings { get; set; }
    public virtual DbSet<Director> Directors { get; set; }
    public virtual DbSet<Genre> Genres { get; set; }
    public virtual DbSet<Hall> Halls { get; set; }
    public virtual DbSet<Language> Languages { get; set; }
    public virtual DbSet<Movie> Movies { get; set; }
    public virtual DbSet<MovieActor> MovieActors { get; set; }
    public virtual DbSet<Seat> Seats { get; set; }
    public virtual DbSet<Session> Sessions { get; set; }
    public virtual DbSet<Ticket> Tickets { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseNpgsql("Host=localhost;Database=postgres;Username=postgres;Password=postgres");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder
            .HasPostgresEnum("AgeRestrictionLevel", new[] { "0+", "12+", "16+", "18+" })
            .HasPostgresEnum("BookingStatusEnum", new[] { "Inprogress", "Paid", "Cancelled" })
            .HasPostgresEnum("SeatTypeEnum", new[] { "Standard", "VIP" });

        
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("AspNetUsers");
            entity.Property(e => e.FirstName).HasMaxLength(50).HasColumnName("FirstName");
            entity.Property(e => e.LastName).HasMaxLength(50).HasColumnName("LastName");
            entity.Property(e => e.BirthDate).HasColumnType("date").HasColumnName("BirthDate");
        });

        
        modelBuilder.Entity<Actor>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Actors");
            entity.ToTable("Actors");
            entity.Property(e => e.FirstName).HasMaxLength(50).HasColumnName("FirstName");
            entity.Property(e => e.LastName).HasMaxLength(50).HasColumnName("LastName");
            entity.Property(e => e.PhotoUri).HasMaxLength(255).HasColumnName("PhotoUri");
        });
        
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Bookings");
            entity.ToTable("Bookings");
            entity.Property(e => e.BookingTime)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(0) without time zone")
                .HasColumnName("BookingTime");

            entity.Property(e => e.UserId).HasColumnName("UserId");
            
            entity.HasOne(d => d.User).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_BookingsUserId");
        });
        
        modelBuilder.Entity<Director>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Directors");
            entity.ToTable("Directors");
            entity.Property(e => e.FirstName).HasMaxLength(50).HasColumnName("FirstName");
            entity.Property(e => e.LastName).HasMaxLength(50).HasColumnName("LastName");
            entity.Property(e => e.PhotoUri).HasMaxLength(255).HasColumnName("PhotoUri");
        });
        
        modelBuilder.Entity<Genre>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Genres");
            entity.ToTable("Genres");
            entity.HasIndex(e => e.Name, "GenresNameKey").IsUnique();
            entity.Property(e => e.Name).HasMaxLength(50).HasColumnName("Name");
        });

        modelBuilder.Entity<Language>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Languages");
            entity.ToTable("Languages");
            entity.HasIndex(e => e.Name, "LanguagesNameKey").IsUnique();
            entity.Property(e => e.Name).HasMaxLength(50).HasColumnName("Name");
        });
        
        modelBuilder.Entity<Hall>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Halls");
            entity.ToTable("Halls");
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(30).HasColumnName("Name");
            entity.Property(e => e.PriceModifier).HasPrecision(3, 2).HasDefaultValue(1.0m).HasColumnName("PriceModifier");
        });

        modelBuilder.Entity<Seat>(entity =>
        {
            entity.HasIndex(s => new { s.HallId, s.RowNumber, s.SeatNumber })
                .IsUnique();
            entity.HasKey(e => e.Id).HasName("PK_Seats");
            entity.ToTable("Seats");
            entity.Property(e => e.PriceModifier).HasPrecision(4, 2).HasDefaultValue(1.0m).HasColumnName("PriceModifier");
            entity.Property(e => e.RowNumber).HasColumnType("smallint");
            entity.Property(e => e.SeatNumber).HasColumnType("smallint");
            
            entity.HasOne(d => d.Hall).WithMany(p => p.Seats)
                .HasForeignKey(d => d.HallId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_SeatsHallId");
        });

        
        modelBuilder.Entity<Movie>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Movies");
            entity.ToTable("Movies");
            entity.Property(e => e.BasePrice).HasPrecision(6, 2).HasColumnName("BasePrice"); 
            entity.Property(e => e.Rating).HasPrecision(3, 1).HasColumnName("Rating");

            entity.HasOne(d => d.Director).WithMany(p => p.Movies)
                .HasForeignKey(d => d.DirectorId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_MoviesDirectorId");
            
            entity.HasMany(d => d.Genres).WithMany(p => p.Movies)
                .UsingEntity<Dictionary<string, object>>(
                    "MovieGenre",
                    r => r.HasOne<Genre>().WithMany().HasForeignKey("GenreId").OnDelete(DeleteBehavior.Cascade),
                    l => l.HasOne<Movie>().WithMany().HasForeignKey("MovieId").OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.HasKey("MovieId", "GenreId").HasName("MovieGenresPkey");
                        j.ToTable("MovieGenres");
                    });
        });

        modelBuilder.Entity<MovieActor>(entity =>
        {
            entity.HasKey(e => new { e.MovieId, e.ActorId }).HasName("PK_MovieActors");
            entity.ToTable("MovieActors");
            entity.HasOne(d => d.Actor).WithMany(p => p.MovieActors).HasForeignKey(d => d.ActorId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(d => d.Movie).WithMany(p => p.MovieActors).HasForeignKey(d => d.MovieId).OnDelete(DeleteBehavior.Cascade);
        });

        
        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Sessions");
            entity.ToTable("Sessions");
            entity.Property(e => e.StartTime).HasColumnType("timestamp(0) without time zone")
                .HasColumnName("StartTime");

            
            entity.HasOne(d => d.Movie).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.MovieId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.Hall).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.HallId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.Language).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.LanguageId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Tickets");
            entity.ToTable("Tickets");
            entity.HasIndex(e => new { e.SessionId, e.SeatId }, "IdxUniqueActiveSeat").IsUnique()
                .HasFilter("(\"IsActive\" = true)");
            
            entity.Property(e => e.ActualPrice).HasPrecision(6, 2).HasColumnName("ActualPrice");
            entity.Property(e => e.IsActive).HasDefaultValue(true).HasColumnName("IsActive");
            
            entity.HasOne(d => d.Booking).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(d => d.Seat).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.SeatId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.Session).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.SessionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}