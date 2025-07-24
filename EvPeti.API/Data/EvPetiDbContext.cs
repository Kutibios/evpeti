using Microsoft.EntityFrameworkCore;
using EvPeti.API.Models;

namespace EvPeti.API.Data
{
    public class EvPetiDbContext : DbContext
    {
        public EvPetiDbContext(DbContextOptions<EvPetiDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Pet> Pets { get; set; }
        public DbSet<Listing> Listings { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Duty> Duties { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Booking ile User arasındaki Owner ilişkisi
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Owner)
                .WithMany(u => u.OwnerBookings)
                .HasForeignKey(b => b.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Booking ile User arasındaki Sitter ilişkisi
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Sitter)
                .WithMany(u => u.SitterBookings)
                .HasForeignKey(b => b.SitterId)
                .OnDelete(DeleteBehavior.Restrict);

            // Diğer ilişkiler için de benzer şekilde ekleme yapabilirsin.

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict); // veya .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict); // veya .OnDelete(DeleteBehavior.NoAction);

            // Reviews tablosu için:
            modelBuilder.Entity<Review>()
                .HasOne(r => r.From)
                .WithMany()
                .HasForeignKey(r => r.FromId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.To)
                .WithMany()
                .HasForeignKey(r => r.ToId)
                .OnDelete(DeleteBehavior.Restrict);

            // Booking ilişkisi için de benzer şekilde ekleyebilirsin.
        }
    }
}