using Microsoft.EntityFrameworkCore;
using EvPeti.API.Models;

namespace EvPeti.API.Data
{
    public class EvPetiDbContext : DbContext
    {
        public EvPetiDbContext(DbContextOptions<EvPetiDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User tablosu için konfigürasyon
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.City).HasMaxLength(50);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Rating).HasPrecision(3, 2);
            });
        }
    }
}