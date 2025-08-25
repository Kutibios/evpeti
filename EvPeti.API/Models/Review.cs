using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Review
    {
        public int Id { get; set; }
        
        // Hangi rezervasyon için değerlendirme
        public int BookingId { get; set; }
        public Booking? Booking { get; set; }
        
        // Değerlendiren ve değerlendirilen kullanıcılar
        public int ReviewerId { get; set; } // Değerlendiren kullanıcı
        public User? Reviewer { get; set; }
        
        public int ReviewedUserId { get; set; } // Değerlendirilen kullanıcı
        public User? ReviewedUser { get; set; }
        
        // Değerlendirme detayları
        public int Rating { get; set; } // 1-5 arası puan
        public string Comment { get; set; } = string.Empty;
        
        // Zaman damgası
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
