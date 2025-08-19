using EvPeti.API.Models;

namespace EvPeti.API.Services.DL
{
    public interface IPetDLService
    {
        Task<IEnumerable<Pet>> GetAllAsync();
        Task<Pet?> GetByIdAsync(int id);
        Task<IEnumerable<Pet>> GetByUserIdAsync(int userId);
        Task<Pet> CreateAsync(Pet pet);
        Task<Pet> UpdateAsync(int id, Pet pet);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
