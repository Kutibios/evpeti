using System;

namespace EvPeti.API.Models
{
    public class Message
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public Guid? BookingId { get; set; }
        public string Content { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public User Sender { get; set; }
        public User Receiver { get; set; }
        public Booking Booking { get; set; }
    }
}
