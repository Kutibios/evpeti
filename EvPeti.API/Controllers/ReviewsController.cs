
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EvPeti.API.Data;
using EvPeti.API.Models;

namespace EvPeti.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly EvPetiDbContext _context;

        public ReviewsController(EvPetiDbContext context)
        {
            _context = context;
        }

        // POST: api/reviews
        [HttpPost]
        public async Task<ActionResult<Review>> CreateReview([FromBody] CreateReviewDto createReviewDto)
        {
            try
            {
                // Rezervasyonun tamamlanmış olup olmadığını kontrol et
                var booking = await _context.Bookings.FindAsync(createReviewDto.BookingId);
                if (booking == null)
                {
                    return BadRequest("Rezervasyon bulunamadı");
                }

                if (booking.Status != "Completed")
                {
                    return BadRequest("Sadece tamamlanmış rezervasyonlar için değerlendirme yapılabilir");
                }

                // Daha önce değerlendirme yapılıp yapılmadığını kontrol et
                var existingReview = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.BookingId == createReviewDto.BookingId && 
                                            r.ReviewerId == createReviewDto.ReviewerId);

                if (existingReview != null)
                {
                    return BadRequest("Bu rezervasyon için zaten değerlendirme yapılmış");
                }

                var review = new Review
                {
                    BookingId = createReviewDto.BookingId,
                    ReviewerId = createReviewDto.ReviewerId,
                    ReviewedUserId = createReviewDto.ReviewedUserId,
                    Rating = createReviewDto.Rating,
                    Comment = createReviewDto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                // Değerlendirilen kullanıcının ortalama puanını güncelle
                await UpdateUserRating(createReviewDto.ReviewedUserId);

                // Değerlendirmeyi include ederek döndür
                var createdReview = await _context.Reviews
                    .Include(r => r.Reviewer)
                    .Include(r => r.ReviewedUser)
                    .FirstOrDefaultAsync(r => r.Id == review.Id);

                return CreatedAtAction(nameof(GetReview), new { id = review.Id }, createdReview);
            }
            catch (Exception ex)
            {
                return BadRequest($"Değerlendirme oluşturulurken hata: {ex.Message}");
            }
        }

        // GET: api/reviews/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReview(int id)
        {
            var review = await _context.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.ReviewedUser)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
            {
                return NotFound();
            }

            return Ok(review);
        }

        // GET: api/reviews/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetUserReviews(int userId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.ReviewedUser)
                .Where(r => r.ReviewedUserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }

        // GET: api/reviews/booking/{bookingId}
        [HttpGet("booking/{bookingId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetBookingReviews(int bookingId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.ReviewedUser)
                .Where(r => r.BookingId == bookingId)
                .ToListAsync();

            return Ok(reviews);
        }

        private async Task UpdateUserRating(int userId)
        {
            var userReviews = await _context.Reviews
                .Where(r => r.ReviewedUserId == userId)
                .ToListAsync();

            if (userReviews.Any())
            {
                var averageRating = userReviews.Average(r => r.Rating);
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.Rating = (decimal)averageRating;
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"User {userId} rating updated to {averageRating}");
                }
            }
        }
    }

    public class CreateReviewDto
    {
        public int BookingId { get; set; }
        public int ReviewerId { get; set; }
        public int ReviewedUserId { get; set; }
        public int Rating { get; set; } // 1-5 arası
        public string Comment { get; set; } = string.Empty;
    }
}