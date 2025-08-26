
using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Models;
using EvPeti.API.Services;
using EvPeti.API.Services.Managers;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PetsController : ControllerBase
    {
        private readonly PetManager _petManager;

        public PetsController(PetManager petManager)
        {
            _petManager = petManager;
        }

        [HttpGet, Route("[action]")]
        public IActionResult GetAllPets()
        {
            var result = _petManager.GetAllPets();
            return ReturnResult(result);
        }

        [HttpGet, Route("[action]")]
        public IActionResult Test()
        {
            return Ok(new { message = "Test endpoint çalışıyor", timestamp = DateTime.UtcNow });
        }

        [HttpPost, Route("[action]")]
        public IActionResult CreatePet([FromBody] Pet pet)
        {
            try
            {
                // Basit validation
                if (pet == null)
                {
                    return BadRequest(new { success = false, message = "Pet data is required" });
                }

                // PetManager'a ekle
                // TODO: CreatePet metodu PetManager'a eklenmeli
                return Ok(new { success = true, message = "Pet created successfully", data = pet });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        [HttpGet, Route("[action]/{id}")]
        public IActionResult GetPetById(int id)
        {
            var result = _petManager.GetPetById(id);
            return ReturnResult(result);
        }

        [HttpGet, Route("[action]/{userId}")]
        public IActionResult GetPetsByUserId(int userId)
        {
            var result = _petManager.GetPetsByUserId(userId);
            return ReturnResult(result);
        }

        private IActionResult ReturnResult<T>(DataResult<T> result)
        {
            if (result.Success)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }
    }
}