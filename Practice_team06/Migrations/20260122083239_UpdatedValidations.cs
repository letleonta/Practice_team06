using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Practice_team06.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedValidations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SeatStatus",
                table: "Seats");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:AgeRestrictionLevel", "0+,12+,16+,18+")
                .Annotation("Npgsql:Enum:BookingStatusEnum", "Inprogress,Paid,Cancelled")
                .Annotation("Npgsql:Enum:SeatTypeEnum", "Standard,VIP")
                .OldAnnotation("Npgsql:Enum:AgeRestrictionLevel", "0+,12+,16+,18+")
                .OldAnnotation("Npgsql:Enum:BookingStatusEnum", "Inprogress,Paid,Cancelled")
                .OldAnnotation("Npgsql:Enum:SeatStatusEnum", "Free,Reserved,Sold")
                .OldAnnotation("Npgsql:Enum:SeatTypeEnum", "Standard,VIP");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Tickets",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "BookingTime",
                table: "Bookings",
                type: "timestamp(0) without time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp(0) without time zone",
                oldNullable: true,
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "BirthDate",
                table: "AspNetUsers",
                type: "date",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "date",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:AgeRestrictionLevel", "0+,12+,16+,18+")
                .Annotation("Npgsql:Enum:BookingStatusEnum", "Inprogress,Paid,Cancelled")
                .Annotation("Npgsql:Enum:SeatStatusEnum", "Free,Reserved,Sold")
                .Annotation("Npgsql:Enum:SeatTypeEnum", "Standard,VIP")
                .OldAnnotation("Npgsql:Enum:AgeRestrictionLevel", "0+,12+,16+,18+")
                .OldAnnotation("Npgsql:Enum:BookingStatusEnum", "Inprogress,Paid,Cancelled")
                .OldAnnotation("Npgsql:Enum:SeatTypeEnum", "Standard,VIP");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Tickets",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AddColumn<int>(
                name: "SeatStatus",
                table: "Seats",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<DateTime>(
                name: "BookingTime",
                table: "Bookings",
                type: "timestamp(0) without time zone",
                nullable: true,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp(0) without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "BirthDate",
                table: "AspNetUsers",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "date");
        }
    }
}
