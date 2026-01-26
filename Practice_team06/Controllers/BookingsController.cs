using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.Services;

namespace Practice_team06.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly BookingService _bookingService;

        public BookingsController(BookingService bookingService)
        {
            _bookingService = bookingService;
        }
        private int? GetUserIdFromHeader()
        {
            var userIdHeader = HttpContext.Request.Headers["X-User-Id"].FirstOrDefault();
            if (int.TryParse(userIdHeader, out var userId))
                return userId;
            return null;
        }
        
        // GET: api/Bookings/my
        // Get all client bookings
        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = GetUserIdFromHeader();
            if (userId == null)
                return BadRequest("Invalid or missing X-User-Id");

            try
            {
                var bookings = await _bookingService.GetBookingsForUserAsync(userId.Value);
                return Ok(bookings);
            }
            catch (KeyNotFoundException keyNotFoundException)
            {
                return NotFound(keyNotFoundException.Message);
            }
        }
        
        // GET: api/Bookings/5
        // Get booking by id
        [HttpGet("{bookingId}")]
        public async Task<ActionResult<Booking>> GetBooking(int bookingId)
        {
            var userId = GetUserIdFromHeader();
            if (userId == null)
                return BadRequest("Invalid or missing X-User-Id");

            try
            {
                var booking = await _bookingService.GetBookingByIdAsync(userId.Value, bookingId);
                return Ok(booking);
            }
            catch (KeyNotFoundException keyNotFoundException)
            {
                return NotFound(keyNotFoundException.Message);
            }
        }
        
        // POST: api/Bookings
        // Create booking
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Booking>> PostBooking()
        {
            var userId = GetUserIdFromHeader();
            if (userId == null)
                return BadRequest("Invalid or missing X-User-Id");
            try
            {
                var booking = await _bookingService.CreateBookingAsync(userId.Value);
                return Ok(booking);
            }
            catch (KeyNotFoundException keyNotFoundException)
            {
                return NotFound(keyNotFoundException.Message);
            }
        }

        // PUT: api/Bookings/5/cancel
        // Cancel booking
        [HttpPut("{bookingId}/cancel")]
        public async Task<IActionResult> CancelBooking(int bookingId)
        {
            var userId = GetUserIdFromHeader();
            if (userId == null)
                return BadRequest("Invalid or missing X-User-Id");

            try
            {
                await _bookingService.CancelBookingAsync(userId.Value, bookingId);
                return NoContent();
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
        
        // PUT: api/Bookings/5/confirm
        // Mark booking as paid
        [HttpPut("{bookingId}/confirm")]
        public async Task<IActionResult> ConfirmBooking(int bookingId)
        {
            var userId = GetUserIdFromHeader();
            if (userId == null)
                return BadRequest("Invalid or missing X-User-Id");

            try {
                await _bookingService.ConfirmBookingAsync(userId.Value, bookingId);
                return NoContent();
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
