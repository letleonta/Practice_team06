using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Practice_team06.Migrations
{
    /// <inheritdoc />
    public partial class Updatedticket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Tickets",
                type: "boolean",
                nullable: false,
                defaultValue: true,
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
            
            migrationBuilder.AlterColumn<decimal>(
                name: "PriceModifier",
                table: "Seats",
                type: "numeric(4,2)",
                precision: 4,
                scale: 2,
                nullable: false,
                defaultValue: 1.0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(4,2)",
                oldPrecision: 4,
                oldScale: 2,
                oldNullable: true,
                oldDefaultValue: 1.0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Tickets",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "BookingTime",
                table: "Bookings",
                type: "timestamp(0) without time zone",
                nullable: true,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp(0) without time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");
            
            migrationBuilder.AlterColumn<decimal>(
                name: "PriceModifier",
                table: "Seats",
                type: "numeric(4,2)",
                precision: 4,
                scale: 2,
                nullable: true,
                defaultValue: 1.0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(4,2)",
                oldPrecision: 4,
                oldScale: 2,
                oldDefaultValue: 1.0m);
        }
    }
}
