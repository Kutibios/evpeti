using EvPeti.API.Models;

namespace EvPeti.API.Services
{
    public interface IListingService
    {
        Task<IEnumerable<Listing>> GetUserListingsAsync(int userId);
        Task<Listing?> GetListingByIdAsync(int id);
        Task<Listing> CreateListingAsync(Listing listing);
        Task<Listing> UpdateListingAsync(int id, Listing listing);
        Task DeleteListingAsync(int id);
        Task<bool> ValidateListingAsync(Listing listing);
    }
}
