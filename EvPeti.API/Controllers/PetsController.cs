
using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Data;
using EvPeti.API.Models;
using System.Text.Json;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PetsController : ControllerBase
    {
        private readonly EvPetiDbContext _context;

        public PetsController(EvPetiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var pets = _context.Pets.ToList();
            return Ok(pets);
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetByUserId(int userId)
        {
            var pets = _context.Pets.Where(p => p.UserId == userId).ToList();
            return Ok(pets);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Pet pet)
        {
            Console.WriteLine($"Pet create request received");
            
            // Request body'yi logla
            var requestBody = Request.Body;
            Request.EnableBuffering();
            Request.Body.Position = 0;
            using var reader = new StreamReader(Request.Body);
            var bodyString = reader.ReadToEndAsync().Result;
            Console.WriteLine($"Request body: {bodyString}");
            Request.Body.Position = 0;
            
            if (pet == null)
            {
                Console.WriteLine("Pet is null");
                return BadRequest("Pet bilgileri boş olamaz");
            }

            Console.WriteLine($"Pet object: {JsonSerializer.Serialize(pet)}");

            try
            {
                // User navigation property'sini null yap
                pet.User = null;
                
                Console.WriteLine($"Adding pet to database: {pet.Name}, UserId: {pet.UserId}");
                _context.Pets.Add(pet);
                _context.SaveChanges();
                Console.WriteLine($"Pet created successfully with ID: {pet.Id}");
                return CreatedAtAction(nameof(GetAll), new { id = pet.Id }, pet);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating pet: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Pet oluşturulurken hata oluştu: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var pet = _context.Pets.Find(id);
            if (pet == null)
            {
                return NotFound($"Pet with ID {id} not found");
            }

            try
            {
                _context.Pets.Remove(pet);
                _context.SaveChanges();
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting pet: {ex.Message}");
                return StatusCode(500, $"Pet silinirken hata oluştu: {ex.Message}");
            }
        }
    }
}