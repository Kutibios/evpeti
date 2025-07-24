using System;

namespace EvPeti.API.Models
{
    public class Notification
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; }
        public string Content { get; set; }
        public bool IsRead { get; set; }
        public Guid? RelatedId { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation property
        public User User { get; set; }
    }
}
