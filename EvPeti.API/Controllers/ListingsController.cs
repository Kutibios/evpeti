
using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Models;
using EvPeti.API.Services.Managers;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListingsController : ControllerBase
    {
        private readonly ListingManager _listingManager;

        public ListingsController(ListingManager listingManager)
        {
            _listingManager = listingManager;
        }

        [HttpGet]
        public IActionResult GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = _listingManager.GetActiveListings();
                
                if (!result.Success)
                {
                    return BadRequest(result.Message);
                }

                var listings = result.Data.ToList();
                var totalCount = listings.Count;
                
                var listingDtos = listings.Select(l => new ListingDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    Title = l.Title,
                    Type = l.Type,
                    Price = l.Price,
                    Location = l.Location,
                    StartDate = l.StartDate,
                    EndDate = l.EndDate,
                    IsAvailable = l.IsAvailable,
                    Description = l.Description,
                    Status = l.Status,
                    Experience = l.Experience,
                    Services = l.Services,
                    ImageUrls = l.ImageUrls,
                    IsActive = l.IsActive,
                    CreatedAt = l.CreatedAt,
                    
                    // User bilgileri
                    UserName = l.User?.Name,
                    UserEmail = l.User?.Email,
                    UserPhone = l.User?.Phone,
                    UserRating = l.User?.Rating
                });

                var response = new
                {
                    Listings = listingDtos,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetByUserId(int userId)
        {
            try
            {
                var result = _listingManager.GetListingsByUserId(userId);
                
                if (!result.Success)
                {
                    return BadRequest(result.Message);
                }

                var listingDtos = result.Data.Select(l => new ListingDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    Title = l.Title,
                    Type = l.Type,
                    Price = l.Price,
                    Location = l.Location,
                    StartDate = l.StartDate,
                    EndDate = l.EndDate,
                    IsAvailable = l.IsAvailable,
                    Description = l.Description,
                    Status = l.Status,
                    Experience = l.Experience,
                    Services = l.Services,
                    ImageUrls = l.ImageUrls,
                    IsActive = l.IsActive,
                    CreatedAt = l.CreatedAt,
                    
                    // User bilgileri
                    UserName = l.User?.Name,
                    UserEmail = l.User?.Email,
                    UserPhone = l.User?.Phone,
                    UserRating = l.User?.Rating
                });
                
                return Ok(listingDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                Console.WriteLine($"ListingsController: GetById çağrıldı - ID: {id}");
                var result = _listingManager.GetListingById(id);
                
                if (!result.Success)
                {
                    return NotFound(result.Message);
                }

                var listing = result.Data;
                Console.WriteLine($"ListingsController: Manager'dan dönen listing: {listing?.Id}");

                // Response için DTO oluştur
                var listingDto = new ListingDto
                {
                    Id = listing.Id,
                    UserId = listing.UserId,
                    Title = listing.Title,
                    Type = listing.Type,
                    Price = listing.Price,
                    Location = listing.Location,
                    StartDate = listing.StartDate,
                    EndDate = listing.EndDate,
                    IsAvailable = listing.IsAvailable,
                    Description = listing.Description,
                    Status = listing.Status,
                    Experience = listing.Experience,
                    Services = listing.Services,
                    ImageUrls = listing.ImageUrls,
                    IsActive = listing.IsActive,
                    CreatedAt = listing.CreatedAt,
                    
                    // User bilgileri
                    UserName = listing.User?.Name,
                    UserEmail = listing.User?.Email,
                    UserPhone = listing.User?.Phone,
                    UserRating = listing.User?.Rating
                };

                Console.WriteLine($"ListingsController: DTO oluşturuldu - ID: {listingDto.Id}, Title: {listingDto.Title}");
                Console.WriteLine($"ListingsController: DTO JSON: {System.Text.Json.JsonSerializer.Serialize(listingDto)}");

                return Ok(listingDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateListingDto createDto)
        {
            try
            {
                if (createDto == null)
                    return BadRequest("Listing data is required");

                // TODO: ListingManager'a CreateListing metodu eklenmeli
                return BadRequest("CreateListing metodu henüz implement edilmedi");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateListingDto updateDto)
        {
            try
            {
                if (updateDto == null)
                    return BadRequest("Listing data is required");

                // TODO: ListingManager'a UpdateListing metodu eklenmeli
                return BadRequest("UpdateListing metodu henüz implement edilmedi");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                // TODO: ListingManager'a DeleteListing metodu eklenmeli
                return BadRequest("DeleteListing metodu henüz implement edilmedi");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}