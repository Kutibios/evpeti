using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Message
    {
        public int Id { get; set; }
        
        // Sohbet katılımcıları
        public int SenderId { get; set; }
        public User? Sender { get; set; }
        
        public int ReceiverId { get; set; }
        public User? Receiver { get; set; }
        
        // Hangi rezervasyon için sohbet
        public int BookingId { get; set; }
        public Booking? Booking { get; set; }
        
        // Mesaj içeriği
        public string Content { get; set; } = string.Empty;
        public string? AttachmentUrl { get; set; } // Fotoğraf, dosya vs.
        
        // Mesaj durumu
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
        
        // Zaman damgası
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
