using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Review
    {
        public int Id { get; set; }
        [Range(1, 5)] public decimal Rating { get; set; }
        [StringLength(1000)] public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
