using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Practice_team06.Models;


public partial class PostgresContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    public PostgresContext()
    {
    }

    public PostgresContext(DbContextOptions<PostgresContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Actor> Actors { get; set; }
    public virtual DbSet<Booking> Bookings { get; set; }
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
            .HasPostgresEnum("age_restriction_level", new[] { "0+", "12+", "16+", "18+" })
            .HasPostgresEnum("booking_status_enum", new[] { "Inprogress", "Paid", "Cancelled" })
            .HasPostgresEnum("seat_status_enum", new[] { "Free", "Reserved", "Sold" })
            .HasPostgresEnum("seat_type_enum", new[] { "Standard", "VIP" });
            
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("AspNetUsers");
            entity.Property(e => e.FirstName).HasMaxLength(50).HasColumnName("first_name");
            entity.Property(e => e.LastName).HasMaxLength(50).HasColumnName("last_name");
            entity.Property(e => e.BirthDate).HasColumnType("date").HasColumnName("birth_date");
            
        });
        
        
        modelBuilder.Entity<Actor>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("actors_pkey");
            entity.ToTable("actors");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.FirstName).HasMaxLength(50).HasColumnName("first_name");
            entity.Property(e => e.LastName).HasMaxLength(50).HasColumnName("last_name");
            entity.Property(e => e.PhotoUri).HasMaxLength(255).HasColumnName("photo_uri");
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("bookings_pkey");
            entity.ToTable("bookings");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BookingTime)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(0) without time zone")
                .HasColumnName("booking_time");
            
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.HasOne(d => d.User).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("bookings_user_id_fkey");
        });

        modelBuilder.Entity<Genre>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("genres_pkey");
            entity.ToTable("genres");
            entity.HasIndex(e => e.Name, "genres_name_key").IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasMaxLength(50).HasColumnName("name");
        });

        modelBuilder.Entity<Hall>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("halls_pkey");
            entity.ToTable("halls");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Name).HasMaxLength(30).HasColumnName("name");
            entity.Property(e => e.PriceModifier).HasPrecision(3, 2).HasDefaultValue(1.0m).HasColumnName("price_modifier");
        });

        modelBuilder.Entity<Language>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("languages_pkey");
            entity.ToTable("languages");
            entity.HasIndex(e => e.Name, "languages_name_key").IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasMaxLength(50).HasColumnName("name");
        });

        modelBuilder.Entity<Movie>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("movies_pkey");
            entity.ToTable("movies");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BasePrice).HasPrecision(6, 2).HasColumnName("base_price");
            entity.Property(e => e.PosterUri).HasMaxLength(255).HasColumnName("main_poster_uri");
            entity.Property(e => e.TrailerUri).HasMaxLength(255).HasColumnName("main_trailer_uri");
            entity.Property(e => e.Rating).HasPrecision(3, 1).HasColumnName("rating");
            entity.Property(e => e.Title).HasMaxLength(255).HasColumnName("title");

            entity.HasMany(d => d.Genres).WithMany(p => p.Movies)
                .UsingEntity<Dictionary<string, object>>(
                    "MovieGenre",
                    r => r.HasOne<Genre>().WithMany().HasForeignKey("GenreId").HasConstraintName("movie_genres_genre_id_fkey"),
                    l => l.HasOne<Movie>().WithMany().HasForeignKey("MovieId").HasConstraintName("movie_genres_movie_id_fkey"),
                    j =>
                    {
                        j.HasKey("MovieId", "GenreId").HasName("movie_genres_pkey");
                        j.ToTable("movie_genres");
                        j.IndexerProperty<int>("MovieId").HasColumnName("movie_id");
                        j.IndexerProperty<int>("GenreId").HasColumnName("genre_id");
                    });
        });

        modelBuilder.Entity<MovieActor>(entity =>
        {
            entity.HasKey(e => new { e.MovieId, e.ActorId }).HasName("movie_actors_pkey");
            entity.ToTable("movie_actors");
            entity.Property(e => e.MovieId).HasColumnName("movie_id");
            entity.Property(e => e.ActorId).HasColumnName("actor_id");
            entity.Property(e => e.RoleName).HasMaxLength(100).HasColumnName("role_name");

            entity.HasOne(d => d.Actor).WithMany(p => p.MovieActors).HasForeignKey(d => d.ActorId).HasConstraintName("movie_actors_actor_id_fkey");
            entity.HasOne(d => d.Movie).WithMany(p => p.MovieActors).HasForeignKey(d => d.MovieId).HasConstraintName("movie_actors_movie_id_fkey");
        });

        modelBuilder.Entity<Seat>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("seats_pkey");
            entity.ToTable("seats");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.HallId).HasColumnName("hall_id");
            entity.Property(e => e.PriceModifier).HasPrecision(4, 2).HasDefaultValue(1.0m).HasColumnName("price_modifier");
            entity.Property(e => e.RowNumber).HasColumnName("row_number").HasColumnType("smallint");
            entity.Property(e => e.SeatNumber).HasColumnName("seat_number").HasColumnType("smallint");

            entity.HasOne(d => d.Hall).WithMany(p => p.Seats).HasForeignKey(d => d.HallId).HasConstraintName("seats_hall_id_fkey");
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("sessions_pkey");
            entity.ToTable("sessions");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.StartTime).HasColumnType("timestamp(0) without time zone").HasColumnName("start_time");

            entity.HasOne(d => d.Hall).WithMany(p => p.Sessions).HasForeignKey(d => d.HallId).HasConstraintName("sessions_hall_id_fkey");
            entity.HasOne(d => d.Language).WithMany(p => p.Sessions).HasForeignKey(d => d.LanguageId).OnDelete(DeleteBehavior.ClientSetNull).HasConstraintName("sessions_language_id_fkey");
            entity.HasOne(d => d.Movie).WithMany(p => p.Sessions).HasForeignKey(d => d.MovieId).HasConstraintName("sessions_movie_id_fkey");
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("tickets_pkey");
            entity.ToTable("tickets");
            entity.HasIndex(e => new { e.SessionId, e.SeatId }, "idx_unique_active_seat").IsUnique().HasFilter("(is_active = true)");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ActualPrice).HasPrecision(6, 2).HasColumnName("actual_price");
            entity.Property(e => e.IsActive).HasDefaultValue(true).HasColumnName("is_active");

            entity.HasOne(d => d.Booking).WithMany(p => p.Tickets).HasForeignKey(d => d.BookingId).HasConstraintName("tickets_booking_id_fkey");
            entity.HasOne(d => d.Seat).WithMany(p => p.Tickets).HasForeignKey(d => d.SeatId).OnDelete(DeleteBehavior.ClientSetNull).HasConstraintName("tickets_seat_id_fkey");
            entity.HasOne(d => d.Session).WithMany(p => p.Tickets).HasForeignKey(d => d.SessionId).OnDelete(DeleteBehavior.ClientSetNull).HasConstraintName("tickets_session_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}