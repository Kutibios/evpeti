using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Models
{
    public class PetDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Name { get; set; }
        public string? Type { get; set; }
        public string? Breed { get; set; }
        public int Age { get; set; }
        public string? Gender { get; set; }
        public string? Color { get; set; }
        public decimal Weight { get; set; }
        public string? HealthNotes { get; set; }
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreatePetDto
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string Breed { get; set; } = string.Empty;
        
        [Required]
        [Range(0, 30)]
        public int Age { get; set; }
        
        [StringLength(10)]
        public string? Gender { get; set; }
        
        [StringLength(50)]
        public string? Color { get; set; }
        
        [Required]
        [Range(0.1, 100)]
        public decimal Weight { get; set; }
        
        [StringLength(500)]
        public string? HealthNotes { get; set; }
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        [StringLength(255)]
        public string? Photo { get; set; }
    }

    public class UpdatePetDto
    {
        [StringLength(50)]
        public string? Name { get; set; }
        
        [StringLength(50)]
        public string? Type { get; set; }
        
        [StringLength(50)]
        public string? Breed { get; set; }
        
        [Range(0, 30)]
        public int? Age { get; set; }
        
        [StringLength(10)]
        public string? Gender { get; set; }
        
        [StringLength(50)]
        public string? Color { get; set; }
        
        [Range(0.1, 100)]
        public decimal? Weight { get; set; }
        
        [StringLength(500)]
        public string? HealthNotes { get; set; }
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        [StringLength(255)]
        public string? Photo { get; set; }
    }
}
