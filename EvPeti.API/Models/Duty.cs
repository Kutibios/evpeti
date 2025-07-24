using System;

namespace EvPeti.API.Models
{
    public class Duty
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public string PhotoUrl { get; set; }
        public bool IsDone { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation property
        public Booking Booking { get; set; }
    }
}
