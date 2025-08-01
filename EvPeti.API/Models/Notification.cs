using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        [StringLength(50)] public string? Type { get; set; }
        [StringLength(500)] public string? Content { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual User? User { get; set; }
    }
}
