using EvPeti.API.Models;

namespace EvPeti.API.Services.DL
{
    public interface IListingDLService
    {
        Task<IEnumerable<Listing>> GetAllAsync();
        Task<Listing?> GetByIdAsync(int id);
        Task<IEnumerable<Listing>> GetByUserIdAsync(int userId);
        Task<Listing> CreateAsync(Listing listing);
        Task<Listing> UpdateAsync(int id, Listing listing);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
