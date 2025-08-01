using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }
        public int SitterId { get; set; }
        public int PetId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Price { get; set; }
        [StringLength(50)] public string? Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual User? Owner { get; set; }
        public virtual User? Sitter { get; set; }
        public virtual Pet? Pet { get; set; }
    }
}
