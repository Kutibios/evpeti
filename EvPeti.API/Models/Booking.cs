using System;

namespace EvPeti.API.Models
{
    public class Booking
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public Guid SitterId { get; set; }
        public Guid PetId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public User Owner { get; set; }
        public User Sitter { get; set; }
        public Pet Pet { get; set; }
    }
}
