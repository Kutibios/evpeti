using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class ListingDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Title { get; set; }
        public string? Type { get; set; }
        public decimal Price { get; set; }
        public string? Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsAvailable { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public int Experience { get; set; }
        public string? Services { get; set; }
        public string? ImageUrls { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // User bilgileri
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public string? UserPhone { get; set; }
        public decimal? UserRating { get; set; }
    }

    public class CreateListingDto
    {
        [Required]
        public int UserId { get; set; }
        
        [StringLength(100)]
        public string? Title { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Location { get; set; } = string.Empty;
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public bool IsAvailable { get; set; } = true;
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        [StringLength(50)]
        public string Status { get; set; } = "active";
        
        public int Experience { get; set; } = 0;
        
        [StringLength(500)]
        public string? Services { get; set; }
        
        public string? ImageUrls { get; set; }
        
        public bool IsActive { get; set; } = true;
    }

    public class UpdateListingDto
    {
        [StringLength(100)]
        public string? Title { get; set; }
        
        [StringLength(50)]
        public string? Type { get; set; }
        
        [Range(0.01, double.MaxValue)]
        public decimal? Price { get; set; }
        
        [StringLength(100)]
        public string? Location { get; set; }
        
        public DateTime? StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        public bool? IsAvailable { get; set; }
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        [StringLength(50)]
        public string? Status { get; set; }
        
        public int? Experience { get; set; }
        
        [StringLength(500)]
        public string? Services { get; set; }
        
        public string? ImageUrls { get; set; }
        
        public bool? IsActive { get; set; }
    }
}
