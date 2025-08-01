using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Duty
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        [StringLength(100)] public string? Title { get; set; }
        [StringLength(500)] public string? Description { get; set; }
        public bool IsCompleted { get; set; } = false;
        [StringLength(255)] public string? PhotoUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        // Navigation property
        public virtual Booking? Booking { get; set; }
    }
}
