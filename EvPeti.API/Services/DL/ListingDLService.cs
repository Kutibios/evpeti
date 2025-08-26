using EvPeti.API.Data;
using EvPeti.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace EvPeti.API.Services.DL
{
    public class ListingDLService : IListingDLService
    {
        private readonly EvPetiDbContext _context;

        public ListingDLService(EvPetiDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Listing>> GetAllAsync()
        {
            return await _context.Listings
                .Include(l => l.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<Listing>> GetAllActiveAsync()
        {
            return await _context.Listings
                .Where(l => l.IsActive && l.IsAvailable)
                .Include(l => l.User)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Listing>> GetAllActiveAsync(int page, int pageSize)
        {
            return await _context.Listings
                .Where(l => l.IsActive && l.IsAvailable)
                .Include(l => l.User)
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalActiveCountAsync()
        {
            return await _context.Listings
                .Where(l => l.IsActive && l.IsAvailable)
                .CountAsync();
        }

        public async Task<Listing?> GetByIdAsync(int id)
        {
            Console.WriteLine($"ListingDLService: GetByIdAsync çağrıldı - ID: {id}");
            var result = await _context.Listings
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == id);
            Console.WriteLine($"ListingDLService: Veritabanından dönen result: {result?.Id}");
            Console.WriteLine($"ListingDLService: User bilgisi: {result?.User?.Name}");
            return result;
        }

        public async Task<IEnumerable<Listing>> GetByUserIdAsync(int userId)
        {
            return await _context.Listings
                .Where(l => l.UserId == userId)
                .Include(l => l.User)
                .ToListAsync();
        }

        public async Task<Listing> CreateAsync(Listing listing)
        {
            listing.CreatedAt = DateTime.UtcNow;
            
            // Navigation property'yi null yap ve sadece gerekli alanları kopyala
            var newListing = new Listing
            {
                UserId = listing.UserId,
                Title = listing.Title,
                Type = listing.Type,
                Price = listing.Price,
                Location = listing.Location,
                StartDate = listing.StartDate,
                EndDate = listing.EndDate,
                IsAvailable = listing.IsAvailable,
                Description = listing.Description,
                Status = listing.Status,
                Experience = listing.Experience,
                Services = listing.Services,
                ImageUrls = listing.ImageUrls,
                IsActive = listing.IsActive,
                CreatedAt = listing.CreatedAt
            };
            
            _context.Listings.Add(newListing);
            await _context.SaveChangesAsync();
            
            return newListing;
        }

        public async Task<Listing> UpdateAsync(int id, Listing listing)
        {
            var existingListing = await _context.Listings.FindAsync(id);
            if (existingListing == null)
                throw new InvalidOperationException($"Listing with ID {id} not found");

            // Update fields
            existingListing.Title = listing.Title;
            existingListing.Type = listing.Type;
            existingListing.Price = listing.Price;
            existingListing.Location = listing.Location;
            existingListing.StartDate = listing.StartDate;
            existingListing.EndDate = listing.EndDate;
            existingListing.IsAvailable = listing.IsAvailable;
            existingListing.Description = listing.Description;
            existingListing.Status = listing.Status;
            existingListing.Experience = listing.Experience;
            existingListing.Services = listing.Services;
            existingListing.ImageUrls = listing.ImageUrls;
            existingListing.IsActive = listing.IsActive;

            await _context.SaveChangesAsync();
            return existingListing;
        }

        public async Task DeleteAsync(int id)
        {
            var listing = await _context.Listings.FindAsync(id);
            if (listing != null)
            {
                _context.Listings.Remove(listing);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Listings.AnyAsync(l => l.Id == id);
        }

        // Yeni eklenen metodlar
        public IEnumerable<Listing> GetList(Expression<Func<Listing, bool>>? filter = null)
        {
            var query = _context.Listings.Include(l => l.User).AsQueryable();
            
            if (filter != null)
            {
                query = query.Where(filter);
            }
            
            return query.ToList();
        }

        public Listing? Get(Expression<Func<Listing, bool>> filter)
        {
            return _context.Listings.Include(l => l.User).FirstOrDefault(filter);
        }
    }
}
