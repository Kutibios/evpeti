using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int FromId { get; set; }
        public int ToId { get; set; }
        public int? BookingId { get; set; }
        [Range(1, 5)] public int Rating { get; set; }
        [StringLength(1000)] public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual User? From { get; set; }
        public virtual User? To { get; set; }
        public virtual Booking? Booking { get; set; }
    }
}
