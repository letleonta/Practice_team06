using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Practice_team06.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserSchemaAndTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "bookings_customer_id_fkey",
                table: "bookings");

            migrationBuilder.DropTable(
                name: "employees");

            migrationBuilder.DropPrimaryKey(
                name: "customers_pkey",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "total_price",
                table: "bookings");

            migrationBuilder.RenameTable(
                name: "customers",
                newName: "users");

            migrationBuilder.RenameColumn(
                name: "main_trailer_url",
                table: "movies",
                newName: "main_trailer_uri");

            migrationBuilder.RenameColumn(
                name: "main_poster_url",
                table: "movies",
                newName: "main_poster_uri");

            migrationBuilder.RenameColumn(
                name: "customer_id",
                table: "bookings",
                newName: "user_id");

            migrationBuilder.RenameIndex(
                name: "IX_bookings_customer_id",
                table: "bookings",
                newName: "IX_bookings_user_id");

            migrationBuilder.RenameColumn(
                name: "photo_url",
                table: "actors",
                newName: "photo_uri");

            migrationBuilder.RenameIndex(
                name: "customers_phone_key",
                table: "users",
                newName: "users_phone_key");

            migrationBuilder.RenameIndex(
                name: "customers_email_key",
                table: "users",
                newName: "users_email_key");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:age_restriction_level", "0+,12+,16+,18+")
                .Annotation("Npgsql:Enum:booking_status_enum", "Inprogress,Paid,Cancelled")
                .Annotation("Npgsql:Enum:role_enum", "Client,Admin")
                .Annotation("Npgsql:Enum:seat_status_enum", "Free,Reserved,Sold")
                .Annotation("Npgsql:Enum:seat_type_enum", "Standard,VIP")
                .OldAnnotation("Npgsql:Enum:age_restriction_level", "0+,12+,16+,18+")
                .OldAnnotation("Npgsql:Enum:booking_status_enum", "Inprogress,Paid,Cancelled")
                .OldAnnotation("Npgsql:Enum:seat_status_enum", "Free,Reserved,Sold")
                .OldAnnotation("Npgsql:Enum:seat_type_enum", "Standard,VIP");

            migrationBuilder.AlterColumn<decimal>(
                name: "actual_price",
                table: "tickets",
                type: "numeric(6,2)",
                precision: 6,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2);

            migrationBuilder.AlterColumn<DateTime>(
                name: "start_time",
                table: "sessions",
                type: "timestamp(0) without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<short>(
                name: "seat_number",
                table: "seats",
                type: "smallint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<short>(
                name: "row_number",
                table: "seats",
                type: "smallint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<decimal>(
                name: "price_modifier",
                table: "seats",
                type: "numeric(4,2)",
                precision: 4,
                scale: 2,
                nullable: true,
                defaultValue: 1.0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2,
                oldNullable: true,
                oldDefaultValue: 1.0m);

            migrationBuilder.AlterColumn<decimal>(
                name: "base_price",
                table: "movies",
                type: "numeric(6,2)",
                precision: 6,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "languages",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<decimal>(
                name: "price_modifier",
                table: "halls",
                type: "numeric(3,2)",
                precision: 3,
                scale: 2,
                nullable: false,
                defaultValue: 1.0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldPrecision: 10,
                oldScale: 2,
                oldDefaultValue: 1.0m);

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "halls",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "genres",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<DateTime>(
                name: "booking_time",
                table: "bookings",
                type: "timestamp(0) without time zone",
                nullable: true,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true,
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AlterColumn<string>(
                name: "first_name",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "users",
                type: "character varying(320)",
                maxLength: 320,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<DateTime>(
                name: "birth_date",
                table: "users",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "users_pkey",
                table: "users",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "bookings_user_id_fkey",
                table: "bookings",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "bookings_user_id_fkey",
                table: "bookings");

            migrationBuilder.DropPrimaryKey(
                name: "users_pkey",
                table: "users");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "users");

            migrationBuilder.RenameTable(
                name: "users",
                newName: "customers");

            migrationBuilder.RenameColumn(
                name: "main_trailer_uri",
                table: "movies",
                newName: "main_trailer_url");

            migrationBuilder.RenameColumn(
                name: "main_poster_uri",
                table: "movies",
                newName: "main_poster_url");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "bookings",
                newName: "customer_id");

            migrationBuilder.RenameIndex(
                name: "IX_bookings_user_id",
                table: "bookings",
                newName: "IX_bookings_customer_id");

            migrationBuilder.RenameColumn(
                name: "photo_uri",
                table: "actors",
                newName: "photo_url");

            migrationBuilder.RenameIndex(
                name: "users_phone_key",
                table: "customers",
                newName: "customers_phone_key");

            migrationBuilder.RenameIndex(
                name: "users_email_key",
                table: "customers",
                newName: "customers_email_key");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:age_restriction_level", "0+,12+,16+,18+")
                .Annotation("Npgsql:Enum:booking_status_enum", "Inprogress,Paid,Cancelled")
                .Annotation("Npgsql:Enum:seat_status_enum", "Free,Reserved,Sold")
                .Annotation("Npgsql:Enum:seat_type_enum", "Standard,VIP")
                .OldAnnotation("Npgsql:Enum:age_restriction_level", "0+,12+,16+,18+")
                .OldAnnotation("Npgsql:Enum:booking_status_enum", "Inprogress,Paid,Cancelled")
                .OldAnnotation("Npgsql:Enum:role_enum", "Client,Admin")
                .OldAnnotation("Npgsql:Enum:seat_status_enum", "Free,Reserved,Sold")
                .OldAnnotation("Npgsql:Enum:seat_type_enum", "Standard,VIP");

            migrationBuilder.AlterColumn<decimal>(
                name: "actual_price",
                table: "tickets",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(6,2)",
                oldPrecision: 6,
                oldScale: 2);

            migrationBuilder.AlterColumn<DateTime>(
                name: "start_time",
                table: "sessions",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp(0) without time zone");

            migrationBuilder.AlterColumn<int>(
                name: "seat_number",
                table: "seats",
                type: "integer",
                nullable: false,
                oldClrType: typeof(short),
                oldType: "smallint");

            migrationBuilder.AlterColumn<int>(
                name: "row_number",
                table: "seats",
                type: "integer",
                nullable: false,
                oldClrType: typeof(short),
                oldType: "smallint");

            migrationBuilder.AlterColumn<decimal>(
                name: "price_modifier",
                table: "seats",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true,
                defaultValue: 1.0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(4,2)",
                oldPrecision: 4,
                oldScale: 2,
                oldNullable: true,
                oldDefaultValue: 1.0m);

            migrationBuilder.AlterColumn<decimal>(
                name: "base_price",
                table: "movies",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(6,2)",
                oldPrecision: 6,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "languages",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<decimal>(
                name: "price_modifier",
                table: "halls",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 1.0m,
                oldClrType: typeof(decimal),
                oldType: "numeric(3,2)",
                oldPrecision: 3,
                oldScale: 2,
                oldDefaultValue: 1.0m);

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "halls",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "genres",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<DateTime>(
                name: "booking_time",
                table: "bookings",
                type: "timestamp without time zone",
                nullable: true,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp(0) without time zone",
                oldNullable: true,
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            migrationBuilder.AddColumn<decimal>(
                name: "total_price",
                table: "bookings",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<string>(
                name: "first_name",
                table: "customers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "customers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(320)",
                oldMaxLength: 320);

            migrationBuilder.AlterColumn<DateTime>(
                name: "birth_date",
                table: "customers",
                type: "timestamp without time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "customers_pkey",
                table: "customers",
                column: "id");

            migrationBuilder.CreateTable(
                name: "employees",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    email = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    first_name = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    last_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("employees_pkey", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "employees_email_key",
                table: "employees",
                column: "email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "bookings_customer_id_fkey",
                table: "bookings",
                column: "customer_id",
                principalTable: "customers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
