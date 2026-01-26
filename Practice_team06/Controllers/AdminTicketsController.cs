using Microsoft.AspNetCore.Mvc;
using Practice_team06.Services;

namespace Practice_team06.Controllers
{
    [Route("api/admin/tickets")]
    [ApiController]
    public class AdminTicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public AdminTicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        // GET: api/admin/tickets
        [HttpGet]
        public async Task<IActionResult> GetAllTickets()
        {
            var tickets = await _ticketService.GetAllTicketsAsync();
            return Ok(tickets);
        }

        // GET: api/admin/tickets/5
        [HttpGet("{ticketId}")]
        public async Task<IActionResult> GetTicketById(int ticketId)
        {
            try
            {
                var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
                return Ok(ticket);
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Ticket with ID {ticketId} not found.");
            }
        }
    }
}