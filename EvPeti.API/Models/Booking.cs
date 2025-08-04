using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Price { get; set; }
        [StringLength(50)] public string? Status { get; set; }
        [StringLength(500)] public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
