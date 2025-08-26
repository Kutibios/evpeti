using EvPeti.API.Models;
using System.Linq.Expressions;

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
        
        // Mentor'umuzun önerdiği yeni metodlar
        IEnumerable<Pet> GetList(Expression<Func<Pet, bool>>? filter = null);
        Pet? Get(Expression<Func<Pet, bool>> filter);
    }
}
