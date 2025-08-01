/*
using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Data;
using EvPeti.API.Models;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DutiesController : ControllerBase
    {
        private readonly EvPetiDbContext _context;

        public DutiesController(EvPetiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var duties = _context.Duties.ToList();
            return Ok(duties);
        }
    }
}
*/ 