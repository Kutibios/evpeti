
using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Data;
using EvPeti.API.Models;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListingsController : ControllerBase
    {
        private readonly EvPetiDbContext _context;

        public ListingsController(EvPetiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var listings = _context.Listings.ToList();
            return Ok(listings);
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetByUserId(int userId)
        {
            var listings = _context.Listings.Where(l => l.UserId == userId).ToList();
            return Ok(listings);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Listing listing)
        {
            Console.WriteLine($"Listing create request received");
            
            if (listing == null)
            {
                Console.WriteLine("Listing is null");
                return BadRequest("Listing bilgileri boş olamaz");
            }

            try
            {
                // User navigation property'sini null yap
                listing.User = null;
                
                Console.WriteLine($"Adding listing to database: {listing.Type}, UserId: {listing.UserId}");
                _context.Listings.Add(listing);
                _context.SaveChanges();
                Console.WriteLine($"Listing created successfully with ID: {listing.Id}");
                return CreatedAtAction(nameof(GetAll), new { id = listing.Id }, listing);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating listing: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Listing oluşturulurken hata oluştu: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var listing = _context.Listings.Find(id);
            if (listing == null)
            {
                return NotFound($"Listing with ID {id} not found");
            }

            try
            {
                _context.Listings.Remove(listing);
                _context.SaveChanges();
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting listing: {ex.Message}");
                return StatusCode(500, $"Listing silinirken hata oluştu: {ex.Message}");
            }
        }
    }
}