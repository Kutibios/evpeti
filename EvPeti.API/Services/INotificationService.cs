using EvPeti.API.Models;

namespace EvPeti.API.Services
{
    public interface INotificationService
    {
        Task<Notification> CreateNotificationAsync(Notification notification);
        Task<IEnumerable<Notification>> GetUserNotificationsAsync(int userId);
        Task<Notification> MarkAsReadAsync(int notificationId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
    }
}
