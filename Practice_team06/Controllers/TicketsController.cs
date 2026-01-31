using System.Security.Claims;
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

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                    return Unauthorized("User is not authenticated");

                var userId = int.Parse(userIdClaim.Value);

                try
                {
                    var tickets = await _ticketService.GetTicketsForUserBookingAsync(userId, bookingId.Value);
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
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                    return Unauthorized("User is not authenticated");

                var userId = int.Parse(userIdClaim.Value);
                
                try
                {
                    var ticket = await _ticketService.GetTicketForUserByIdAsync(userId, ticketId);
                    return Ok(ticket);
                }
                catch (KeyNotFoundException)
                {
                    return NotFound($"Ticket with ID {ticketId} not found.");
                }
            }
            return Forbid();
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
