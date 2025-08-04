using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class Message
    {
        public int Id { get; set; }
        [StringLength(1000)] public string? Content { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
