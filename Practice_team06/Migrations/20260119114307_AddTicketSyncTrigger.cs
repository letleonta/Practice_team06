using Microsoft.EntityFrameworkCore.Migrations;
namespace Practice_team06.Migrations;

public partial class AddTicketSyncTrigger : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // 1. Створюємо або оновлюємо функцію
        migrationBuilder.Sql(@"
        CREATE OR REPLACE FUNCTION sync_ticket_status() RETURNS trigger
            LANGUAGE plpgsql
        AS $$
        BEGIN
            IF (NEW.""Status"" = 'Cancelled') THEN
                UPDATE tickets SET ""IsActive"" = FALSE WHERE ""BookingId"" = NEW.""Id"";
            ELSE
                UPDATE tickets SET ""IsActive"" = TRUE WHERE ""BookingId"" = NEW.""Id"";
            END IF;
            RETURN NEW;
        END;
        $$;
    ");
        migrationBuilder.Sql(@"
        CREATE TRIGGER trg_sync_ticket_status
        AFTER UPDATE OF ""Status"" ON bookings
        FOR EACH ROW
        EXECUTE FUNCTION sync_ticket_status();
    ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        
        migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_sync_ticket_status ON bookings;");
        migrationBuilder.Sql("DROP FUNCTION IF EXISTS sync_ticket_status();");
    }
}