
using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Models;
using EvPeti.API.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET: api/notifications/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Notification>>> GetUserNotifications(int userId)
        {
            try
            {
                var notifications = await _notificationService.GetUserNotificationsAsync(userId);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bildirimler yüklenirken hata: {ex.Message}");
            }
        }

        // GET: api/notifications/user/{userId}/unread-count
        [HttpGet("user/{userId}/unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount(int userId)
        {
            try
            {
                var count = await _notificationService.GetUnreadCountAsync(userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return BadRequest($"Okunmamış bildirim sayısı alınırken hata: {ex.Message}");
            }
        }

        // PUT: api/notifications/{id}/mark-read
        [HttpPut("{id}/mark-read")]
        public async Task<ActionResult<Notification>> MarkAsRead(int id)
        {
            try
            {
                var notification = await _notificationService.MarkAsReadAsync(id);
                if (notification == null)
                {
                    return NotFound();
                }
                return Ok(notification);
            }
            catch (Exception ex)
            {
                return BadRequest($"Bildirim okundu olarak işaretlenirken hata: {ex.Message}");
            }
        }

        // PUT: api/notifications/user/{userId}/mark-all-read
        [HttpPut("user/{userId}/mark-all-read")]
        public async Task<ActionResult<bool>> MarkAllAsRead(int userId)
        {
            try
            {
                var result = await _notificationService.MarkAllAsReadAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Tüm bildirimler okundu olarak işaretlenirken hata: {ex.Message}");
            }
        }
    }
}