using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Booking;
using Practice_team06.DTOs.Booking.Stats;
using Practice_team06.DTOs.Common;
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
        
        // GET: api/bookings/
        // Get all bookings
        [HttpGet]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<PagedResult<AdminBookingDetailsDto>>> GetAllBookings([FromQuery] BookingFilterDto filter)
        {
            var bookings = await _bookingService.GetAllBookingsAsync(filter);
            return Ok(bookings);
        }
        
        // GET: api/Bookings/my
        // Get all client bookings
        [HttpGet("my")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<PagedResult<BookingDto>>> GetMyBookings([FromQuery] BookingFilterDto filter)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("User is not authenticated");

            var userId = int.Parse(userIdClaim.Value);

            try
            {
                var bookings = await _bookingService.GetBookingsForUserAsync(userId, filter);
                return Ok(bookings);
            }
            catch (KeyNotFoundException e)
            {
                return NotFound(e.Message);
            }
        }
        
        // GET: api/bookings/stats
        // Get booking stats with filters
        [HttpGet("stats")]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<ActionResult<BookingsStatsDto>> GetStats([FromQuery] BookingFilterDto filter)
        {
            var stats = await _bookingService.GetBookingStatsAsync(filter);
            return Ok(stats);
        }
        
        // GET: api/bookings/5
        // Get booking by id
        [HttpGet("{bookingId}")]
        [Authorize]
        public async Task<ActionResult<Booking>> GetBooking(int bookingId, [FromQuery] BaseFilterDto filter)
        {
            if (User.IsInRole("Admin") || User.IsInRole("Manager"))
            {
                try
                {
                    var booking = await _bookingService.GetBookingByIdAsync<AdminBookingDetailsDto>(null, bookingId, filter);
                    return Ok(booking);
                }
                catch (KeyNotFoundException keyNotFoundException)
                {
                    return NotFound(keyNotFoundException.Message);
                }
            }
            if (User.IsInRole("Customer"))
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                    return Unauthorized("User is not authenticated");

                var userId = int.Parse(userIdClaim.Value);

                try
                {
                    var userBooking = await _bookingService.GetBookingByIdAsync<BookingDetailsDto>(userId, bookingId, filter);
                    return Ok(userBooking);
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
        public async Task<ActionResult<Booking>> PostBooking([FromBody] CreateBookingDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("User is not authenticated");

            var userId = int.Parse(userIdClaim.Value);

            try
            {
                var booking = await _bookingService.CreateBookingAsync(userId, dto);
                return Ok(booking);
            }
            catch (KeyNotFoundException keyNotFoundException)
            {
                return NotFound(keyNotFoundException.Message);
            }
            catch (InvalidOperationException invalidOperationException)
            {
                return BadRequest(invalidOperationException.Message);
            }
        }

        // PUT: api/Bookings/5/cancel
        // Cancel booking
        [HttpPut("{bookingId}/cancel")]
        public async Task<IActionResult> CancelBooking(int bookingId)
        {
            if (User.IsInRole("Admin") || User.IsInRole("Manager"))
            {
                try
                {
                    await _bookingService.CancelBookingAsync(null, bookingId);
                    return NoContent();
                }
                catch (KeyNotFoundException ex)
                {
                    return NotFound(ex.Message);
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }
            if (User.IsInRole("Customer"))
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                    return Unauthorized("User is not authenticated");

                var userId = int.Parse(userIdClaim.Value);

                try
                {
                    await _bookingService.CancelBookingAsync(userId, bookingId);
                    return NoContent();
                }
                catch (KeyNotFoundException ex)
                {
                    return NotFound(ex.Message);
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            return Forbid();
        }
        
        // PUT: api/Bookings/5/confirm
        // Mark booking as paid
        [HttpPut("{bookingId}/confirm")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> ConfirmBooking(int bookingId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("User is not authenticated");

            var userId = int.Parse(userIdClaim.Value);

            try
            {
                await _bookingService.ConfirmBookingAsync(userId, bookingId);
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
        
        // DELETE: api/Bookings/5
        // Delete booking
        [HttpDelete("{bookingId}")]
        [Authorize(Roles = "Admin, Manager")]
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
