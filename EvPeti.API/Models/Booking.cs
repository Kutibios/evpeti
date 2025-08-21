using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Booking
    {
        public int Id { get; set; }
        
        // Rezervasyon yapan kişi
        public int UserId { get; set; }
        public User? User { get; set; }
        
        // Rezervasyon yapılan ilan
        public int ListingId { get; set; }
        public Listing? Listing { get; set; }
        
        // Rezervasyon detayları
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string PetName { get; set; } = string.Empty;
        public int? PetId { get; set; }
        public string? PetType { get; set; }
        public int? PetAge { get; set; }
        public string? Notes { get; set; }
        public decimal TotalPrice { get; set; }
        
        // Rezervasyon durumu
        public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected, Completed, Cancelled
        
        // Zaman damgaları
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? RejectedAt { get; set; }
        
        // İletişim bilgileri
        public string? UserPhone { get; set; }
        public string? UserEmail { get; set; }
    }
}
