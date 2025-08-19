using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Listing
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        [StringLength(100)] public string? Title { get; set; }
        [StringLength(50)] public string? Type { get; set; }
        public decimal Price { get; set; }
        [StringLength(100)] public string? Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsAvailable { get; set; } = true;
        [StringLength(1000)] public string? Description { get; set; }
        [StringLength(50)] public string? Status { get; set; }
        public int Experience { get; set; } = 0;
        [StringLength(500)] public string? Services { get; set; }
        public string? ImageUrls { get; set; } // JSON string olarak saklanacak
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public User? User { get; set; }
    }
}
