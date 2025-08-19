using EvPeti.API.Models;

namespace EvPeti.API.Services
{
    public interface IPetService
    {
        Task<IEnumerable<Pet>> GetUserPetsAsync(int userId);
        Task<Pet?> GetPetByIdAsync(int id);
        Task<Pet> CreatePetAsync(Pet pet);
        Task<Pet> UpdatePetAsync(int id, Pet pet);
        Task DeletePetAsync(int id);
        Task<bool> ValidatePetAsync(Pet pet);
    }
}
