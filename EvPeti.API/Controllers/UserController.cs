using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Data;
using EvPeti.API.Models;
using Microsoft.EntityFrameworkCore;

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
    }
}