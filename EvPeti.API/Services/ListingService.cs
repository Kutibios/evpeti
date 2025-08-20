using EvPeti.API.Models;
using EvPeti.API.Services.DL;

namespace EvPeti.API.Services
{
    public class ListingService : IListingService
    {
        private readonly IListingDLService _listingDL;

        public ListingService(IListingDLService listingDL)
        {
            _listingDL = listingDL;
        }

        public async Task<IEnumerable<Listing>> GetUserListingsAsync(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("Invalid user ID");

            return await _listingDL.GetByUserIdAsync(userId);
        }

        public async Task<IEnumerable<Listing>> GetAllActiveListingsAsync()
        {
            return await _listingDL.GetAllActiveAsync();
        }

        public async Task<IEnumerable<Listing>> GetAllActiveListingsAsync(int page, int pageSize)
        {
            return await _listingDL.GetAllActiveAsync(page, pageSize);
        }

        public async Task<int> GetTotalActiveListingsCountAsync()
        {
            return await _listingDL.GetTotalActiveCountAsync();
        }

        public async Task<Listing?> GetListingByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid listing ID");

            return await _listingDL.GetByIdAsync(id);
        }

        public async Task<Listing> CreateListingAsync(Listing listing)
        {
            // Business validation
            if (!await ValidateListingAsync(listing))
                throw new InvalidOperationException("Listing validation failed");

            // Check if listing already exists for this user with same type and location
            var existingListings = await _listingDL.GetByUserIdAsync(listing.UserId);
            if (existingListings.Any(l => 
                l.Type.ToLower() == listing.Type.ToLower() && 
                l.Location.ToLower() == listing.Location.ToLower()))
            {
                throw new InvalidOperationException($"Listing with type '{listing.Type}' and location '{listing.Location}' already exists for this user");
            }

            return await _listingDL.CreateAsync(listing);
        }

        public async Task<Listing> UpdateListingAsync(int id, Listing listing)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid listing ID");

            // Check if listing exists
            if (!await _listingDL.ExistsAsync(id))
                throw new InvalidOperationException($"Listing with ID {id} not found");

            // Business validation
            if (!await ValidateListingAsync(listing))
                throw new InvalidOperationException("Listing validation failed");

            return await _listingDL.UpdateAsync(id, listing);
        }

        public async Task DeleteListingAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid listing ID");

            if (!await _listingDL.ExistsAsync(id))
                throw new InvalidOperationException($"Listing with ID {id} not found");

            await _listingDL.DeleteAsync(id);
        }

        public async Task<bool> ValidateListingAsync(Listing listing)
        {
            if (listing == null)
                return false;

            // Required fields validation
            if (string.IsNullOrWhiteSpace(listing.Type))
                return false;

            if (listing.Price <= 0)
                return false;

            if (string.IsNullOrWhiteSpace(listing.Location))
                return false;

            if (listing.StartDate >= listing.EndDate)
                return false;

            if (listing.UserId <= 0)
                return false;

            return true;
        }
    }
}
