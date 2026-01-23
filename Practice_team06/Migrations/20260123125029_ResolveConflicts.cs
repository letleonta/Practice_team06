using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Practice_team06.Migrations
{
    /// <inheritdoc />
    public partial class ResolveConflicts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Seats_HallId",
                table: "Seats");

            migrationBuilder.CreateIndex(
                name: "IX_Seats_HallId_RowNumber_SeatNumber",
                table: "Seats",
                columns: new[] { "HallId", "RowNumber", "SeatNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Seats_HallId_RowNumber_SeatNumber",
                table: "Seats");

            migrationBuilder.CreateIndex(
                name: "IX_Seats_HallId",
                table: "Seats",
                column: "HallId");
        }
    }
}
