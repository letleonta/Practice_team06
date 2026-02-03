using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Practice_team06.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedMovieCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Sessions_SessionId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingsUserId",
                table: "Bookings");
            
            migrationBuilder.DropForeignKey(
                name: "FK_MoviesDirectorId",
                table: "Movies");

            migrationBuilder.DropForeignKey(
                name: "FK_SessionsHallId",
                table: "Sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_SessionsLanguageId",
                table: "Sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_SessionsMovieId",
                table: "Sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketsBookingId",
                table: "Tickets");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketsSeatId",
                table: "Tickets");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketsSessionId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "AspNetUsers");

            migrationBuilder.AlterColumn<string>(
                name: "TrailerUri",
                table: "Movies",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PosterUri",
                table: "Movies",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AvatarUri",
                table: "AspNetUsers",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BookingsSessionId",
                table: "Bookings",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            
            migrationBuilder.AddForeignKey(
                name: "FK_BookingsUserId",
                table: "Bookings",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MoviesDirectorId",
                table: "Movies",
                column: "DirectorId",
                principalTable: "Directors",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_SessionsHallId",
                table: "Sessions",
                column: "HallId",
                principalTable: "Halls",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SessionsLanguageId",
                table: "Sessions",
                column: "LanguageId",
                principalTable: "Languages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SessionsMovieId",
                table: "Sessions",
                column: "MovieId",
                principalTable: "Movies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketsBookingId",
                table: "Tickets",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketsSeatId",
                table: "Tickets",
                column: "SeatId",
                principalTable: "Seats",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketsSessionId",
                table: "Tickets",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookingsSessionId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_MoviesDirectorId",
                table: "Movies");

            migrationBuilder.DropForeignKey(
                name: "FK_SessionsHallId",
                table: "Sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_SessionsLanguageId",
                table: "Sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_SessionsMovieId",
                table: "Sessions");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketsBookingId",
                table: "Tickets");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketsSeatId",
                table: "Tickets");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketsSessionId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "AvatarUri",
                table: "AspNetUsers");

            migrationBuilder.AlterColumn<string>(
                name: "TrailerUri",
                table: "Movies",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PosterUri",
                table: "Movies",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Sessions_SessionId",
                table: "Bookings",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
            
            migrationBuilder.AddForeignKey(
                name: "FK_BookingsUserId",
                table: "Bookings",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MoviesDirectorId",
                table: "Movies",
                column: "DirectorId",
                principalTable: "Directors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SessionsHallId",
                table: "Sessions",
                column: "HallId",
                principalTable: "Halls",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SessionsLanguageId",
                table: "Sessions",
                column: "LanguageId",
                principalTable: "Languages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SessionsMovieId",
                table: "Sessions",
                column: "MovieId",
                principalTable: "Movies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketsBookingId",
                table: "Tickets",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketsSeatId",
                table: "Tickets",
                column: "SeatId",
                principalTable: "Seats",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketsSessionId",
                table: "Tickets",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
