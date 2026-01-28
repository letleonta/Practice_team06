using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Services;

namespace Practice_team06.Controllers
{
    [Route("api/bookings/{bookingId:int}/tickets")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }
        
        //copied
        private int? GetUserIdFromHeader()
        {
            var userIdHeader = HttpContext.Request.Headers["X-User-Id"].FirstOrDefault();
            if (int.TryParse(userIdHeader, out var userId))
                return userId;
            return null;
        }
        
        // GET: api/bookings/5/tickets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets(int bookingId)
        {
            var userId = GetUserIdFromHeader();
            if (userId == null)
                return BadRequest("Invalid or missing X-User-Id");

            try
            {
                var tickets = await _ticketService.GetTicketsForUserAsync(
                    userId.Value,
                    bookingId
                );

                return Ok(tickets);
            }
            catch (KeyNotFoundException keyNotFoundException)
            {
                return NotFound(keyNotFoundException.Message);
            }
        }
        
        // POST: api/bookings/5/tickets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<IActionResult> CreateTicket(int bookingId, CreateTicketDto dto)
        {
            var userId = GetUserIdFromHeader();
            if (userId == null)
                return BadRequest("Invalid or missing X-User-Id");

            try
            {
                var ticket = await _ticketService.CreateTicketAsync(
                    userId.Value,
                    bookingId,
                    dto
                );

                return Ok(ticket);
            }
            catch (KeyNotFoundException keyNotFoundException)
            {
                return NotFound(keyNotFoundException.Message);
            }
            catch (InvalidOperationException invalidOperationException)
            {
                return BadRequest(invalidOperationException.Message);
            }
            catch (DbUpdateException dbUpdateException)
            {
                return BadRequest(dbUpdateException.Message);
            }
        }
    }
}
