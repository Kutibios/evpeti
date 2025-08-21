
using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Models;
using EvPeti.API.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // POST: api/bookings
        [HttpPost]
        public async Task<ActionResult<Booking>> CreateBooking([FromBody] CreateBookingDto createBookingDto)
        {
            try
            {
                var booking = new Booking
                {
                    UserId = createBookingDto.UserId,
                    ListingId = createBookingDto.ListingId,
                    StartDate = createBookingDto.StartDate,
                    EndDate = createBookingDto.EndDate,
                    PetName = createBookingDto.PetName,
                    PetId = createBookingDto.PetId,
                    PetType = createBookingDto.PetType,
                    PetAge = createBookingDto.PetAge,
                    Notes = createBookingDto.Notes,
                    TotalPrice = createBookingDto.TotalPrice,
                    Status = "Pending",
                    UserPhone = createBookingDto.UserPhone,
                    UserEmail = createBookingDto.UserEmail,
                    CreatedAt = DateTime.UtcNow
                };

                var createdBooking = await _bookingService.CreateBookingAsync(booking);
                return CreatedAtAction(nameof(GetBooking), new { id = createdBooking.Id }, createdBooking);
            }
            catch (Exception ex)
            {
                return BadRequest($"Rezervasyon oluşturulurken hata: {ex.Message}");
            }
        }

        // GET: api/bookings/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetUserBookings(int userId)
        {
            try
            {
                var bookings = await _bookingService.GetUserBookingsAsync(userId);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return BadRequest($"Kullanıcı rezervasyonları yüklenirken hata: {ex.Message}");
            }
        }

        // GET: api/bookings/listing/{listingId}
        [HttpGet("listing/{listingId}")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetListingBookings(int listingId)
        {
            try
            {
                var bookings = await _bookingService.GetListingBookingsAsync(listingId);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return BadRequest($"İlan rezervasyonları yüklenirken hata: {ex.Message}");
            }
        }

        // GET: api/bookings/owner/{ownerId}
        [HttpGet("owner/{ownerId}")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetOwnerBookings(int ownerId)
        {
            try
            {
                var bookings = await _bookingService.GetOwnerBookingsAsync(ownerId);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return BadRequest($"Ev sahibi rezervasyonları yüklenirken hata: {ex.Message}");
            }
        }

        // GET: api/bookings/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Booking>> GetBooking(int id)
        {
            try
            {
                var booking = await _bookingService.GetBookingByIdAsync(id);
                if (booking == null)
                {
                    return NotFound();
                }
                return Ok(booking);
            }
            catch (Exception ex)
            {
                return BadRequest($"Rezervasyon yüklenirken hata: {ex.Message}");
            }
        }

        // PUT: api/bookings/{id}/status
        [HttpPut("{id}/status")]
        public async Task<ActionResult<Booking>> UpdateBookingStatus(int id, [FromBody] UpdateStatusDto updateStatusDto)
        {
            try
            {
                var updatedBooking = await _bookingService.UpdateBookingStatusAsync(id, updateStatusDto.Status);
                return Ok(updatedBooking);
            }
            catch (Exception ex)
            {
                return BadRequest($"Rezervasyon durumu güncellenirken hata: {ex.Message}");
            }
        }
    }

    public class CreateBookingDto
    {
        public int UserId { get; set; }
        public int ListingId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string PetName { get; set; } = string.Empty;
        public int? PetId { get; set; }
        public string? PetType { get; set; }
        public int? PetAge { get; set; }
        public string? Notes { get; set; }
        public decimal TotalPrice { get; set; }
        public string? UserPhone { get; set; }
        public string? UserEmail { get; set; }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}