using EvPeti.API.Models;
using EvPeti.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EvPeti.API.Services
{
    public class BookingService : IBookingService
    {
        private readonly EvPetiDbContext _context;
        private readonly INotificationService _notificationService;

        public BookingService(EvPetiDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<Booking> CreateBookingAsync(Booking booking)
        {
            // Rezervasyonu oluştur
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // İlan sahibine bildirim gönder
            try
            {
                var listing = await _context.Listings
                    .Include(l => l.User)
                    .FirstOrDefaultAsync(l => l.Id == booking.ListingId);

                if (listing?.User != null)
                {
                    var notification = new Notification
                    {
                        UserId = listing.User.Id,
                        Type = "BookingRequest",
                        Title = "Yeni Rezervasyon Talebi",
                        Content = $"{booking.PetName} adlı evcil hayvan için rezervasyon talebi geldi. Tarih: {booking.StartDate:dd/MM/yyyy} - {booking.EndDate:dd/MM/yyyy}",
                        RelatedId = booking.Id,
                        RelatedType = "Booking",
                        ExtraData = $"{{\"petName\":\"{booking.PetName}\",\"startDate\":\"{booking.StartDate:yyyy-MM-dd}\",\"endDate\":\"{booking.EndDate:yyyy-MM-dd}\",\"totalPrice\":{booking.TotalPrice}}}"
                    };

                    await _notificationService.CreateNotificationAsync(notification);
                }
            }
            catch (Exception ex)
            {
                // Bildirim gönderilemese bile rezervasyon oluşturulmuş olmalı
                // Loglama yapılabilir
                Console.WriteLine($"Bildirim oluşturulurken hata: {ex.Message}");
            }

            return booking;
        }

        public async Task<IEnumerable<Booking>> GetUserBookingsAsync(int userId)
        {
            return await _context.Bookings
                .Include(b => b.Listing)
                .Include(b => b.User)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetListingBookingsAsync(int listingId)
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Where(b => b.ListingId == listingId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetOwnerBookingsAsync(int ownerId)
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Listing)
                .Where(b => b.Listing != null && b.Listing.UserId == ownerId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<Booking> GetBookingByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.Listing)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<Booking> UpdateBookingStatusAsync(int id, string status)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Listing)
                .FirstOrDefaultAsync(b => b.Id == id);
                
            if (booking == null)
            {
                throw new ArgumentException("Rezervasyon bulunamadı");
            }

            booking.Status = status;
            booking.UpdatedAt = DateTime.UtcNow;

            if (status == "Accepted")
            {
                booking.AcceptedAt = DateTime.UtcNow;
            }
            else if (status == "Rejected")
            {
                booking.RejectedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Rezervasyon yapan kullanıcıya bildirim gönder
            try
            {
                if (booking.User != null)
                {
                    string title = "";
                    string content = "";

                    switch (status)
                    {
                        case "Accepted":
                            title = "Rezervasyon Kabul Edildi";
                            content = $"'{booking.Listing?.Title ?? "İlan"}' için rezervasyon talebiniz kabul edildi! Ev sahibi ile iletişime geçebilirsiniz.";
                            break;
                        case "Rejected":
                            title = "Rezervasyon Reddedildi";
                            content = $"'{booking.Listing?.Title ?? "İlan"}' için rezervasyon talebiniz maalesef reddedildi.";
                            break;
                        case "Completed":
                            title = "Rezervasyon Tamamlandı";
                            content = $"'{booking.Listing?.Title ?? "İlan"}' rezervasyonunuz tamamlandı. Deneyiminizi değerlendirmeyi unutmayın!";
                            break;
                    }

                    if (!string.IsNullOrEmpty(title))
                    {
                        var notification = new Notification
                        {
                            UserId = booking.UserId,
                            Type = $"Booking{status}",
                            Title = title,
                            Content = content,
                            RelatedId = booking.Id,
                            RelatedType = "Booking",
                            ExtraData = $"{{\"status\":\"{status}\",\"listingTitle\":\"{booking.Listing?.Title ?? ""}\"}}"
                        };

                        await _notificationService.CreateNotificationAsync(notification);
                    }
                }
            }
            catch (Exception ex)
            {
                // Bildirim gönderilemese bile rezervasyon durumu güncellenmiş olmalı
                Console.WriteLine($"Bildirim oluşturulurken hata: {ex.Message}");
            }

            return booking;
        }
    }
}
