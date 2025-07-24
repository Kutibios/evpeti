using System;

namespace EvPeti.API.Models
{
    public class Listing
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; }
        public Guid? PetId { get; set; }
        public string Location { get; set; }
        public DateTime AvailableFrom { get; set; }
        public DateTime AvailableTo { get; set; }
        public decimal PricePerDay { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public User User { get; set; }
        public Pet Pet { get; set; }
    }
}
