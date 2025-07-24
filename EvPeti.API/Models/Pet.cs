using System;

namespace EvPeti.API.Models
{
    public class Pet
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; }
        public string Species { get; set; }
        public string Breed { get; set; }
        public int? Age { get; set; }
        public string Gender { get; set; }
        public decimal? Weight { get; set; }
        public string HealthNotes { get; set; }
        public string Photo { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation property
        public User User { get; set; }
    }
}
