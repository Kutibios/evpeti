using System;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(255)]
        public string Password { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? City { get; set; }
        
        [StringLength(20)]
        public string? Phone { get; set; }
        
        public bool IsSitter { get; set; } = false;
        
        public decimal Rating { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
