using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Services;

namespace Practice_team06.Controllers
{
    [Route("api/[controller]")]
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
        
        // GET: api/tickets?bookingId=5
        [HttpGet]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets([FromQuery] int? bookingId)
        {
            if (User.IsInRole("Admin"))
            {
                var tickets = bookingId.HasValue
                    ? await _ticketService.GetTicketsForBookingAsync(bookingId.Value)
                    : await _ticketService.GetAllTicketsAsync();
                return Ok(tickets);
            }
            if (User.IsInRole("Customer"))
            {
                if (!bookingId.HasValue)
                    return BadRequest("BookingId is required for customers");

                var userId = GetUserIdFromHeader();
                if (userId == null)
                    return BadRequest("Invalid or missing X-User-Id");

                try
                {
                    var tickets = await _ticketService.GetTicketsForUserBookingAsync(userId.Value, bookingId.Value);
                    return Ok(tickets);
                }
                catch (KeyNotFoundException keyNotFoundException)
                {
                    return NotFound(keyNotFoundException.Message);
                }
            }
            return Forbid();
        }
        
        // GET: api/tickets/5
        [HttpGet("{ticketId}")]
        [Authorize(Roles = "Admin, Customer")]
        public async Task<IActionResult> GetTicketById(int ticketId)
        {
            if (User.IsInRole("Admin"))
            {
                var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
                return Ok(ticket);
            }
            if (User.IsInRole("Customer"))
            {
                var userId = GetUserIdFromHeader();
                if (userId == null)
                    return BadRequest("Invalid or missing X-User-Id");
                
                try
                {
                    var ticket = await _ticketService.GetTicketForUserByIdAsync(userId.Value, ticketId);
                    return Ok(ticket);
                }
                catch (KeyNotFoundException)
                {
                    return NotFound($"Ticket with ID {ticketId} not found.");
                }
            }
            return Forbid();
        }
        
        // POST: api/tickets?bookingId=5
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateTicket([FromQuery] int bookingId, CreateTicketDto dto)
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
        
        // DELETE: api/tickets/5
        [HttpDelete("{ticketId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTicket(int ticketId)
        {
            try
            {
                await _ticketService.DeleteTicketAsync(ticketId);
                return NoContent();
            }
            catch (KeyNotFoundException e)
            {
                return NotFound(e.Message);
            }
        }
    }
}
