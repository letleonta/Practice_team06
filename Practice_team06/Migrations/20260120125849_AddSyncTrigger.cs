using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Practice_team06.Migrations
{
    public partial class AddSyncTrigger : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            
            migrationBuilder.Sql(@"
                CREATE OR REPLACE FUNCTION sync_ticket_status() RETURNS trigger
                LANGUAGE plpgsql
                AS $$
                BEGIN
                    IF (NEW.""Status""::text = 'Cancelled') THEN
                        UPDATE ""Tickets"" 
                        SET ""IsActive"" = FALSE 
                        WHERE ""BookingId"" = NEW.""Id"";
                    ELSE
                        UPDATE ""Tickets"" 
                        SET ""IsActive"" = TRUE 
                        WHERE ""BookingId"" = NEW.""Id"";
                    END IF;
                    RETURN NEW;
                END;
                $$;
            ");
            
            migrationBuilder.Sql(@"
                CREATE TRIGGER trg_sync_ticket_status
                AFTER UPDATE OF ""Status"" ON ""Bookings""
                FOR EACH ROW
                EXECUTE FUNCTION sync_ticket_status();
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS trg_sync_ticket_status ON ""Bookings"";");
            migrationBuilder.Sql(@"DROP FUNCTION IF EXISTS sync_ticket_status();");
        }
    }
}