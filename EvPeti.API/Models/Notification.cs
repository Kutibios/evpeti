using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Notification
    {
        public int Id { get; set; }
        [StringLength(100)] public string Title { get; set; } = string.Empty;
        [StringLength(500)] public string Message { get; set; } = string.Empty;
        [StringLength(50)] public string? Type { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
