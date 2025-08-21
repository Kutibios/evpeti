using EvPeti.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EvPeti.API.Services
{
    public interface IBookingService
    {
        Task<Booking> CreateBookingAsync(Booking booking);
        Task<IEnumerable<Booking>> GetUserBookingsAsync(int userId);
        Task<IEnumerable<Booking>> GetListingBookingsAsync(int listingId);
        Task<IEnumerable<Booking>> GetOwnerBookingsAsync(int ownerId);
        Task<Booking> GetBookingByIdAsync(int id);
        Task<Booking> UpdateBookingStatusAsync(int id, string status);
    }
}
