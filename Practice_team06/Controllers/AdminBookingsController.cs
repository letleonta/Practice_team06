using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.Booking;
using Practice_team06.Models;
using Practice_team06.Services;

namespace Practice_team06.Controllers
{
    [Route("api/admin/bookings")]
    [ApiController]
    public class AdminBookingsController : ControllerBase
    {
        private readonly BookingService _bookingService;

        public AdminBookingsController(BookingService bookingService)
        {
            _bookingService = bookingService;
        }
        
        // GET: api/admin/bookings/
        // Get all bookings
        [HttpGet]
        public async Task<IActionResult> GetAllBookings([FromQuery] BookingFilterDto filter)
        {
            var bookings = await _bookingService.GetAllBookingsAsync(filter);
            return Ok(bookings);
        }

        // GET: api/admin/bookings/5
        // Get booking by id
        [HttpGet("{bookingId}")]
        public async Task<ActionResult<Booking>> GetBooking(int bookingId)
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
        
        // DELETE: api/AdminBookings/5
        // Delete booking
        [HttpDelete("{bookingId}")]
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
