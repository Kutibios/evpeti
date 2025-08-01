using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EvPeti.API.Data;
using EvPeti.API.Models;
using System.Security.Cryptography;
using System.Text;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly EvPetiDbContext _context;

        public UsersController(EvPetiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.Name, u.Email, u.City, u.IsSitter, u.Rating })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Email kontrolü
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Bu e-posta adresi zaten kayıtlı" });
                }

                // Şifreyi hash'le
                var passwordHash = HashPassword(request.Password);

                // Yeni kullanıcı oluştur
                var user = new User
                {
                    Name = request.Name,
                    Email = request.Email,
                    Password = passwordHash,
                    City = request.City,
                    Phone = request.Phone,
                    IsSitter = request.IsSitter,
                    Rating = 0,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Kullanıcı bilgilerini döndür (şifre hariç)
                var userResponse = new
                {
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    city = user.City,
                    isSitter = user.IsSitter,
                    rating = user.Rating
                };

                return Ok(new { message = "Kayıt başarılı", user = userResponse });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kayıt işlemi sırasında hata oluştu", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Kullanıcıyı bul
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null)
                {
                    return BadRequest(new { message = "E-posta veya şifre hatalı" });
                }

                // Şifreyi kontrol et
                if (!VerifyPassword(request.Password, user.Password))
                {
                    return BadRequest(new { message = "E-posta veya şifre hatalı" });
                }

                // Kullanıcı bilgilerini döndür (şifre hariç)
                var userResponse = new
                {
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    city = user.City,
                    isSitter = user.IsSitter,
                    rating = user.Rating
                };

                return Ok(new { message = "Giriş başarılı", user = userResponse });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Giriş işlemi sırasında hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new { u.Id, u.Name, u.Email, u.City, u.IsSitter, u.Rating })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            var hashedInput = HashPassword(password);
            return hashedInput == hashedPassword;
        }
    }

    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public bool IsSitter { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}