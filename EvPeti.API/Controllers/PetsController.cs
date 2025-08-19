
using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Models;
using EvPeti.API.Services;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PetsController : ControllerBase
    {
        private readonly IPetService _petService;

        public PetsController(IPetService petService)
        {
            _petService = petService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var pets = await _petService.GetUserPetsAsync(1); // TODO: Get from auth
                var petDtos = pets.Select(p => new PetDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    Name = p.Name,
                    Type = p.Type,
                    Breed = p.Breed,
                    Age = p.Age,
                    Gender = p.Gender,
                    Color = p.Color,
                    Weight = p.Weight,
                    HealthNotes = p.HealthNotes,
                    Description = p.Description,
                    Photo = p.Photo,
                    CreatedAt = p.CreatedAt
                });
                return Ok(petDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            try
            {
                var pets = await _petService.GetUserPetsAsync(userId);
                var petDtos = pets.Select(p => new PetDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    Name = p.Name,
                    Type = p.Type,
                    Breed = p.Breed,
                    Age = p.Age,
                    Gender = p.Gender,
                    Color = p.Color,
                    Weight = p.Weight,
                    HealthNotes = p.HealthNotes,
                    Description = p.Description,
                    Photo = p.Photo,
                    CreatedAt = p.CreatedAt
                });
                return Ok(petDtos);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var pet = await _petService.GetPetByIdAsync(id);
                if (pet == null)
                    return NotFound($"Pet with ID {id} not found");

                // Response için DTO oluştur
                var petDto = new PetDto
                {
                    Id = pet.Id,
                    UserId = pet.UserId,
                    Name = pet.Name,
                    Type = pet.Type,
                    Breed = pet.Breed,
                    Age = pet.Age,
                    Gender = pet.Gender,
                    Color = pet.Color,
                    Weight = pet.Weight,
                    HealthNotes = pet.HealthNotes,
                    Description = pet.Description,
                    Photo = pet.Photo,
                    CreatedAt = pet.CreatedAt
                };

                return Ok(petDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePetDto createDto)
        {
            try
            {
                if (createDto == null)
                    return BadRequest("Pet data is required");

                // DTO'dan Pet model'ine dönüştür
                var pet = new Pet
                {
                    UserId = createDto.UserId,
                    Name = createDto.Name,
                    Type = createDto.Type,
                    Breed = createDto.Breed,
                    Age = createDto.Age,
                    Gender = createDto.Gender,
                    Color = createDto.Color,
                    Weight = createDto.Weight,
                    HealthNotes = createDto.HealthNotes,
                    Description = createDto.Description,
                    Photo = createDto.Photo
                };

                var newPet = await _petService.CreatePetAsync(pet);
                
                // Response için DTO oluştur
                var responseDto = new PetDto
                {
                    Id = newPet.Id,
                    UserId = newPet.UserId,
                    Name = newPet.Name,
                    Type = newPet.Type,
                    Breed = newPet.Breed,
                    Age = newPet.Age,
                    Gender = newPet.Gender,
                    Color = newPet.Color,
                    Weight = newPet.Weight,
                    HealthNotes = newPet.HealthNotes,
                    Description = newPet.Description,
                    Photo = newPet.Photo,
                    CreatedAt = newPet.CreatedAt
                };

                return CreatedAtAction(nameof(GetById), new { id = newPet.Id }, responseDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePetDto updateDto)
        {
            try
            {
                if (updateDto == null)
                    return BadRequest("Pet data is required");

                // DTO'dan Pet model'ine dönüştür
                var pet = new Pet
                {
                    Name = updateDto.Name,
                    Type = updateDto.Type,
                    Breed = updateDto.Breed,
                    Age = updateDto.Age ?? 0,
                    Gender = updateDto.Gender,
                    Color = updateDto.Color,
                    Weight = updateDto.Weight ?? 0,
                    HealthNotes = updateDto.HealthNotes,
                    Description = updateDto.Description,
                    Photo = updateDto.Photo
                };

                var updatedPet = await _petService.UpdatePetAsync(id, pet);
                
                // Response için DTO oluştur
                var responseDto = new PetDto
                {
                    Id = updatedPet.Id,
                    UserId = updatedPet.UserId,
                    Name = updatedPet.Name,
                    Type = updatedPet.Type,
                    Breed = updatedPet.Breed,
                    Age = updatedPet.Age,
                    Gender = updatedPet.Gender,
                    Color = updatedPet.Color,
                    Weight = updatedPet.Weight,
                    HealthNotes = updatedPet.HealthNotes,
                    Description = updatedPet.Description,
                    Photo = updatedPet.Photo,
                    CreatedAt = updatedPet.CreatedAt
                };

                return Ok(responseDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _petService.DeletePetAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}