
using Microsoft.AspNetCore.Mvc;
using EvPeti.API.Models;
using EvPeti.API.Services;
using System.ComponentModel.DataAnnotations;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListingsController : ControllerBase
    {
        private readonly IListingService _listingService;

        public ListingsController(IListingService listingService)
        {
            _listingService = listingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var listings = await _listingService.GetAllActiveListingsAsync(page, pageSize);
                var totalCount = await _listingService.GetTotalActiveListingsCountAsync();
                
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
        public async Task<IActionResult> GetByUserId(int userId)
        {
            try
            {
                var listings = await _listingService.GetUserListingsAsync(userId);
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
                return Ok(listingDtos);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                Console.WriteLine($"ListingsController: GetById çağrıldı - ID: {id}");
                var listing = await _listingService.GetListingByIdAsync(id);
                Console.WriteLine($"ListingsController: Service'ten dönen listing: {listing?.Id}");
                if (listing == null)
                    return NotFound($"Listing with ID {id} not found");

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
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateListingDto createDto)
        {
            try
            {
                if (createDto == null)
                    return BadRequest("Listing data is required");

                // DTO'dan Listing model'ine dönüştür
                var listing = new Listing
                {
                    UserId = createDto.UserId,
                    Title = createDto.Title,
                    Type = createDto.Type,
                    Price = createDto.Price,
                    Location = createDto.Location,
                    StartDate = createDto.StartDate,
                    EndDate = createDto.EndDate,
                    IsAvailable = createDto.IsAvailable,
                    Description = createDto.Description,
                    Status = createDto.Status,
                    Experience = createDto.Experience,
                    Services = createDto.Services,
                    ImageUrls = createDto.ImageUrls,
                    IsActive = createDto.IsActive
                };

                var newListing = await _listingService.CreateListingAsync(listing);
                
                // Response için DTO oluştur
                var responseDto = new ListingDto
                {
                    Id = newListing.Id,
                    UserId = newListing.UserId,
                    Title = newListing.Title,
                    Type = newListing.Type,
                    Price = newListing.Price,
                    Location = newListing.Location,
                    StartDate = newListing.StartDate,
                    EndDate = newListing.EndDate,
                    IsAvailable = newListing.IsAvailable,
                    Description = newListing.Description,
                    Status = newListing.Status,
                    Experience = newListing.Experience,
                    Services = newListing.Services,
                    ImageUrls = newListing.ImageUrls,
                    IsActive = newListing.IsActive,
                    CreatedAt = newListing.CreatedAt,
                    
                    // User bilgileri
                    UserName = newListing.User?.Name,
                    UserEmail = newListing.User?.Email,
                    UserPhone = newListing.User?.Phone,
                    UserRating = newListing.User?.Rating
                };

                return CreatedAtAction(nameof(GetById), new { id = newListing.Id }, responseDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateListingDto updateDto)
        {
            try
            {
                if (updateDto == null)
                    return BadRequest("Listing data is required");

                // DTO'dan Listing model'ine dönüştür
                var listing = new Listing
                {
                    Title = updateDto.Title,
                    Type = updateDto.Type,
                    Price = updateDto.Price ?? 0,
                    Location = updateDto.Location,
                    StartDate = updateDto.StartDate ?? DateTime.UtcNow,
                    EndDate = updateDto.EndDate ?? DateTime.UtcNow,
                    IsAvailable = updateDto.IsAvailable ?? true,
                    Description = updateDto.Description,
                    Status = updateDto.Status,
                    Experience = updateDto.Experience ?? 0,
                    Services = updateDto.Services,
                    ImageUrls = updateDto.ImageUrls,
                    IsActive = updateDto.IsActive ?? true
                };

                var updatedListing = await _listingService.UpdateListingAsync(id, listing);
                
                // Response için DTO oluştur
                var responseDto = new ListingDto
                {
                    Id = updatedListing.Id,
                    UserId = updatedListing.UserId,
                    Title = updatedListing.Title,
                    Type = updatedListing.Type,
                    Price = updatedListing.Price,
                    Location = updatedListing.Location,
                    StartDate = updatedListing.StartDate,
                    EndDate = updatedListing.EndDate,
                    IsAvailable = updatedListing.IsAvailable,
                    Description = updatedListing.Description,
                    Status = updatedListing.Status,
                    Experience = updatedListing.Experience,
                    Services = updatedListing.Services,
                    ImageUrls = updatedListing.ImageUrls,
                    IsActive = updatedListing.IsActive,
                    CreatedAt = updatedListing.CreatedAt,
                    
                    // User bilgileri
                    UserName = updatedListing.User?.Name,
                    UserEmail = updatedListing.User?.Email,
                    UserPhone = updatedListing.User?.Phone
                };

                return Ok(responseDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _listingService.DeleteListingAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}