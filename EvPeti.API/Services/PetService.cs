using EvPeti.API.Models;
using EvPeti.API.Services.DL;

namespace EvPeti.API.Services
{
    public class PetService : IPetService
    {
        private readonly IPetDLService _petDL;

        public PetService(IPetDLService petDL)
        {
            _petDL = petDL;
        }

        public async Task<IEnumerable<Pet>> GetUserPetsAsync(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("Invalid user ID");

            return await _petDL.GetByUserIdAsync(userId);
        }

        public async Task<Pet?> GetPetByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid pet ID");

            return await _petDL.GetByIdAsync(id);
        }

        public async Task<Pet> CreatePetAsync(Pet pet)
        {
            // Business validation
            if (!await ValidatePetAsync(pet))
                throw new InvalidOperationException("Pet validation failed");

            // Check if pet already exists for this user
            var existingPets = await _petDL.GetByUserIdAsync(pet.UserId);
            if (existingPets.Any(p => p.Name?.ToLower() == pet.Name?.ToLower()))
                throw new InvalidOperationException($"Pet with name '{pet.Name}' already exists for this user");

            return await _petDL.CreateAsync(pet);
        }

        public async Task<Pet> UpdatePetAsync(int id, Pet pet)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid pet ID");

            // Check if pet exists
            if (!await _petDL.ExistsAsync(id))
                throw new InvalidOperationException($"Pet with ID {id} not found");

            // Business validation
            if (!await ValidatePetAsync(pet))
                throw new InvalidOperationException("Pet validation failed");

            return await _petDL.UpdateAsync(id, pet);
        }

        public async Task DeletePetAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid pet ID");

            if (!await _petDL.ExistsAsync(id))
                throw new InvalidOperationException($"Pet with ID {id} not found");

            await _petDL.DeleteAsync(id);
        }

        public async Task<bool> ValidatePetAsync(Pet pet)
        {
            if (pet == null)
                return false;

            // Required fields validation
            if (string.IsNullOrWhiteSpace(pet.Name))
                return false;

            if (string.IsNullOrWhiteSpace(pet.Type))
                return false;

            if (string.IsNullOrWhiteSpace(pet.Breed))
                return false;

            if (pet.Age < 0 || pet.Age > 30)
                return false;

            if (pet.Weight < 0)
                return false;

            if (pet.UserId <= 0)
                return false;

            return true;
        }
    }
}
