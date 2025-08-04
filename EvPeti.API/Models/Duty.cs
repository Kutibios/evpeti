using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Duty
    {
        public int Id { get; set; }
        [StringLength(100)] public string Title { get; set; } = string.Empty;
        [StringLength(500)] public string? Description { get; set; }
        [StringLength(50)] public string? Status { get; set; }
        public bool IsCompleted { get; set; } = false;
        [StringLength(255)] public string? PhotoUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
}
