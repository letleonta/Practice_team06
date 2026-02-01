using System.Security.Claims;
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
        
        // GET: api/bookings/
        // Get all bookings
        [HttpGet]
        [Authorize(Roles = "Admin, Manager")]
        public async Task<IActionResult> GetAllBookings([FromQuery] BookingFilterDto filter)
        {
            var bookings = await _bookingService.GetAllBookingsAsync(filter);
            return Ok(bookings);
        }
        
        // GET: api/Bookings/my
        // Get all client bookings
        [HttpGet("my")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyBookings([FromQuery] BookingFilterDto filter)
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
        
        // GET: api/bookings/5
        // Get booking by id
        [HttpGet("{bookingId}")]
        [Authorize(Roles = "Admin,Customer, Manager")]
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
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                    return Unauthorized("User is not authenticated");

                var userId = int.Parse(userIdClaim.Value);

                try
                {
                    var booking = await _bookingService.GetBookingByIdAsync(userId, bookingId);
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
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CancelBooking(int bookingId)
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
