
using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Data;
using EvPeti.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly EvPetiDbContext _context;

        public MessagesController(EvPetiDbContext context)
        {
            _context = context;
        }

        // GET: api/messages/chat/{bookingId}
        [HttpGet("chat/{bookingId}")]
        public async Task<ActionResult<IEnumerable<Message>>> GetChatMessages(int bookingId)
        {
            try
            {
                var messages = await _context.Messages
                    .Include(m => m.Sender)
                    .Include(m => m.Receiver)
                    .Where(m => m.BookingId == bookingId)
                    .OrderBy(m => m.CreatedAt)
                    .ToListAsync();

                return Ok(messages);
            }
            catch (Exception ex)
            {
                return BadRequest($"Mesajlar yüklenirken hata: {ex.Message}");
            }
        }

        // GET: api/messages/conversations/{userId}
        [HttpGet("conversations/{userId}")]
        public async Task<ActionResult<IEnumerable<ConversationDto>>> GetUserConversations(int userId)
        {
            try
            {
                var conversations = await _context.Messages
                    .Include(m => m.Booking)
                    .Include(m => m.Booking.Listing)
                    .Include(m => m.Sender)
                    .Include(m => m.Receiver)
                    .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                    .GroupBy(m => m.BookingId)
                    .Select(g => new ConversationDto
                    {
                        BookingId = g.Key,
                        LastMessage = g.OrderByDescending(m => m.CreatedAt).First(),
                        UnreadCount = g.Count(m => m.ReceiverId == userId && !m.IsRead),
                        OtherUser = g.First().SenderId == userId 
                            ? g.First().Receiver 
                            : g.First().Sender,
                        Listing = g.First().Booking.Listing
                    })
                    .OrderByDescending(c => c.LastMessage.CreatedAt)
                    .ToListAsync();

                return Ok(conversations);
            }
            catch (Exception ex)
            {
                return BadRequest($"Sohbetler yüklenirken hata: {ex.Message}");
            }
        }

        // POST: api/messages
        [HttpPost]
        public async Task<ActionResult<Message>> SendMessage([FromBody] CreateMessageDto createMessageDto)
        {
            try
            {
                var message = new Message
                {
                    SenderId = createMessageDto.SenderId,
                    ReceiverId = createMessageDto.ReceiverId,
                    BookingId = createMessageDto.BookingId,
                    Content = createMessageDto.Content,
                    AttachmentUrl = createMessageDto.AttachmentUrl,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Messages.Add(message);
                await _context.SaveChangesAsync();

                // Mesajı include ederek döndür
                var createdMessage = await _context.Messages
                    .Include(m => m.Sender)
                    .Include(m => m.Receiver)
                    .FirstOrDefaultAsync(m => m.Id == message.Id);

                return CreatedAtAction(nameof(GetChatMessages), new { bookingId = message.BookingId }, createdMessage);
            }
            catch (Exception ex)
            {
                return BadRequest($"Mesaj gönderilirken hata: {ex.Message}");
            }
        }

        // PUT: api/messages/{id}/read
        [HttpPut("{id}/read")]
        public async Task<ActionResult> MarkAsRead(int id)
        {
            try
            {
                var message = await _context.Messages.FindAsync(id);
                if (message == null)
                {
                    return NotFound();
                }

                message.IsRead = true;
                message.ReadAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest($"Mesaj okundu olarak işaretlenirken hata: {ex.Message}");
            }
        }

        // PUT: api/messages/chat/{bookingId}/read
        [HttpPut("chat/{bookingId}/read")]
        public async Task<ActionResult> MarkChatAsRead(int bookingId, [FromBody] MarkChatAsReadDto dto)
        {
            try
            {
                var messages = await _context.Messages
                    .Where(m => m.BookingId == bookingId && m.ReceiverId == dto.UserId && !m.IsRead)
                    .ToListAsync();

                foreach (var message in messages)
                {
                    message.IsRead = true;
                    message.ReadAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest($"Sohbet okundu olarak işaretlenirken hata: {ex.Message}");
            }
        }
    }

    public class CreateMessageDto
    {
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public int BookingId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? AttachmentUrl { get; set; }
    }

    public class ConversationDto
    {
        public int BookingId { get; set; }
        public Message LastMessage { get; set; } = null!;
        public int UnreadCount { get; set; }
        public User? OtherUser { get; set; }
        public Listing? Listing { get; set; }
    }

    public class MarkChatAsReadDto
    {
        public int UserId { get; set; }
    }
}