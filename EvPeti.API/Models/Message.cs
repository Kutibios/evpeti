using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Message
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public int? BookingId { get; set; }
        [StringLength(1000)] public string? Content { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual User? Sender { get; set; }
        public virtual User? Receiver { get; set; }
        public virtual Booking? Booking { get; set; }
    }
}
