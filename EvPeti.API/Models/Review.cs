using System;

namespace EvPeti.API.Models
{
    public class Review
    {
        public Guid Id { get; set; }
        public Guid FromId { get; set; }
        public Guid ToId { get; set; }
        public Guid BookingId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public User From { get; set; }
        public User To { get; set; }
        public Booking Booking { get; set; }
    }
}
