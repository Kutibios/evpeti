using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Data;
using EvPeti.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly EvPetiDbContext _context;

        public UserController(EvPetiDbContext context)
        {
            _context = context;
        }

        // POST: api/users/register
        [HttpPost("register")]
        public async Task<ActionResult<object>> Register([FromBody] User user)
        {
            try
            {
                // Email kontrolü
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == user.Email);

                if (existingUser != null)
                {
                    return BadRequest("Bu e-posta adresi zaten kullanılıyor");
                }

                // Şifreyi hash'le
                user.Password = HashPassword(user.Password);
                user.CreatedAt = DateTime.UtcNow;

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var response = new
                {
                    message = "Kullanıcı başarıyla kaydedildi",
                    user = new
                    {
                        id = user.Id,
                        name = user.Name,
                        email = user.Email,
                        city = user.City,
                        isSitter = user.IsSitter,
                        rating = 0
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest($"Kayıt işlemi sırasında hata: {ex.Message}");
            }
        }

        // POST: api/users/login
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return BadRequest("E-posta veya şifre hatalı");
                }

                // Şifre kontrolü - önce plain text, sonra hash kontrolü
                bool isPasswordValid = false;
                
                // 1. Plain text şifre kontrolü (mevcut kullanıcılar için)
                if (request.Password == user.Password)
                {
                    isPasswordValid = true;
                    // Şifreyi hash'le ve güncelle
                    user.Password = HashPassword(request.Password);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Password hashed for user: {user.Email}");
                }
                // 2. Hash'lenmiş şifre kontrolü
                else if (VerifyPassword(request.Password, user.Password))
                {
                    isPasswordValid = true;
                }

                if (!isPasswordValid)
                {
                    return BadRequest("E-posta veya şifre hatalı");
                }

                var response = new
                {
                    message = "Giriş başarılı",
                    user = new
                    {
                        id = user.Id,
                        name = user.Name,
                        email = user.Email,
                        city = user.City,
                        isSitter = user.IsSitter,
                        rating = 0
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest($"Giriş işlemi sırasında hata: {ex.Message}");
            }
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (user == null)
                {
                    return NotFound("Kullanıcı bulunamadı");
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest($"Kullanıcı bilgileri yüklenirken hata: {ex.Message}");
            }
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            try
            {
                var users = await _context.Users.ToListAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest($"Kullanıcılar yüklenirken hata: {ex.Message}");
            }
        }

        // POST: api/users/hash-passwords (Utility endpoint - sadece development'ta kullan)
        [HttpPost("hash-passwords")]
        public async Task<ActionResult<object>> HashExistingPasswords()
        {
            try
            {
                var users = await _context.Users.ToListAsync();
                int updatedCount = 0;

                foreach (var user in users)
                {
                    // Şifre zaten hash'lenmiş mi kontrol et
                    if (!user.Password.Contains("=") && user.Password.Length < 44) // Hash olmayan şifreler genelde kısa
                    {
                        user.Password = HashPassword(user.Password);
                        updatedCount++;
                    }
                }

                if (updatedCount > 0)
                {
                    await _context.SaveChangesAsync();
                }

                return Ok(new { 
                    message = $"{updatedCount} kullanıcının şifresi hash'lendi",
                    updatedCount = updatedCount
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Şifre hash'leme hatası: {ex.Message}");
            }
        }

        // POST: api/users/reset-password (Şifre sıfırlama)
        [HttpPost("reset-password")]
        public async Task<ActionResult<object>> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return BadRequest("Bu e-posta adresi bulunamadı");
                }

                // Yeni şifreyi hash'le
                user.Password = HashPassword(request.NewPassword);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Şifre başarıyla güncellendi",
                    user = new
                    {
                        id = user.Id,
                        name = user.Name,
                        email = user.Email,
                        city = user.City,
                        isSitter = user.IsSitter,
                        rating = user.Rating
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Şifre sıfırlama hatası: {ex.Message}");
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string inputPassword, string hashedPassword)
        {
            var inputHash = HashPassword(inputPassword);
            return inputHash == hashedPassword;
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}