using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Common;
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

        // GET: api/tickets
        [HttpGet]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<PagedResult<AdminTicketDto>>> GetAll([FromQuery] BaseFilterDto filter)
        {
            var result = await _ticketService.GetAllTicketsAsync(filter);
            return Ok(result);
        }

        // GET: api/tickets/5
        [HttpGet("{ticketId}")]
        [Authorize]
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
        
        // PUT: tickets/5/refund
        [HttpPut("{id:int}/refund")]
        [Authorize]
        public async Task<IActionResult> Refund(int id)
        {
            try
            {
                if (User.IsInRole("Admin") || User.IsInRole("Manager"))
                {
                    await _ticketService.RefundTicketByAdminAsync(id);
                }
                else
                {
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                    if (userIdClaim == null)
                        return Unauthorized("User is not authenticated");
                    
                    var userId = int.Parse(userIdClaim.Value);
                    
                    await _ticketService.RefundTicketByUserAsync(userId, id);
                }

                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/tickets/5
        [HttpDelete("{ticketId:int}")]
        [Authorize(Roles = "Admin, Manager")]
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