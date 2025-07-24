using System;
using System.Collections.Generic;

namespace EvPeti.API.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string City { get; set; }
        public bool IsSitter { get; set; }
        public string ProfilePhoto { get; set; }
        public string Bio { get; set; }
        public decimal Rating { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public ICollection<Booking> OwnerBookings { get; set; }
        public ICollection<Booking> SitterBookings { get; set; }
    }
}
