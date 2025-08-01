using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Pet
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        [StringLength(50)] public string? Name { get; set; }
        [StringLength(50)] public string? Species { get; set; }
        [StringLength(50)] public string? Breed { get; set; }
        public int Age { get; set; }
        [StringLength(10)] public string? Gender { get; set; }
        public decimal Weight { get; set; }
        [StringLength(500)] public string? HealthNotes { get; set; }
        [StringLength(255)] public string? Photo { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual User? User { get; set; }
    }
}
