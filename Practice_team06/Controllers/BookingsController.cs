using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Booking;
using Practice_team06.Models;
using Practice_team06.Services;

namespace Practice_team06.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
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
        
        // GET: api/bookings/
        // Get all bookings
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBookings([FromQuery] BookingFilterDto filter)
        {
            var bookings = await _bookingService.GetAllBookingsAsync(filter);
            return Ok(bookings);
        }
        
        // GET: api/Bookings/my
        // Get all client bookings
        [HttpGet("my")]
        [Authorize(Roles = "Customer")]
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
        
        // GET: api/bookings/5
        // Get booking by id
        [HttpGet("{bookingId}")]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<Booking>> GetBooking(int bookingId)
        {
            if (User.IsInRole("Admin"))
            {
                try
                {
                    var booking = await _bookingService.GetBookingByIdAsync(bookingId);
                    return Ok(booking);
                }
                catch (KeyNotFoundException keyNotFoundException)
                {
                    return NotFound(keyNotFoundException.Message);
                }
            }
            if (User.IsInRole("Customer"))
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
            return Forbid();
        }
        
        // POST: api/Bookings
        // Create booking
        [HttpPost]
        [Authorize(Roles = "Customer")]
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
        [Authorize(Roles = "Customer")]
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
        [Authorize(Roles = "Customer")]
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
        
        // DELETE: api/AdminBookings/5
        // Delete booking
        [HttpDelete("{bookingId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBooking(int bookingId)
        {
            try
            {
                await _bookingService.DeleteBookingAsync(bookingId);
                return NoContent();
            }
            catch (KeyNotFoundException keyNotFoundException)
            {
                return NotFound(keyNotFoundException.Message);
            }
        }
    }
}
