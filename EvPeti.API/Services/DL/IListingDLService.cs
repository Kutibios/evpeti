using EvPeti.API.Models;
using System.Linq.Expressions;

namespace EvPeti.API.Services.DL
{
    public interface IListingDLService
    {
        Task<IEnumerable<Listing>> GetAllAsync();
        Task<IEnumerable<Listing>> GetAllActiveAsync();
        Task<IEnumerable<Listing>> GetAllActiveAsync(int page, int pageSize);
        Task<int> GetTotalActiveCountAsync();
        Task<Listing?> GetByIdAsync(int id);
        Task<IEnumerable<Listing>> GetByUserIdAsync(int userId);
        Task<Listing> CreateAsync(Listing listing);
        Task<Listing> UpdateAsync(int id, Listing listing);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        
        // Yeni eklenen metodlar
        IEnumerable<Listing> GetList(Expression<Func<Listing, bool>>? filter = null);
        Listing? Get(Expression<Func<Listing, bool>> filter);
    }
}
