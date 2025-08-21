using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Notification
    {
        public int Id { get; set; }
        
        // Bildirim alan kişi
        public int UserId { get; set; }
        public User? User { get; set; }
        
        // Bildirim türü
        public string Type { get; set; } = string.Empty; // BookingRequest, BookingAccepted, BookingRejected, Message, etc.
        
        // Bildirim başlığı ve içeriği
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        
        // Hangi işlemle ilgili
        public int? RelatedId { get; set; } // Booking ID, Message ID vs.
        public string? RelatedType { get; set; } // "Booking", "Message" vs.
        
        // Bildirim durumu
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
        
        // Zaman damgası
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Ek bilgiler (JSON formatında)
        public string? ExtraData { get; set; } // Ek bilgiler için
    }
}
