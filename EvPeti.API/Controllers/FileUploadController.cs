using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

namespace EvPeti.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileUploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public FileUploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("Dosya seçilmedi");
                }

                // Dosya boyutu kontrolü (5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("Dosya boyutu 5MB'dan küçük olmalıdır");
                }

                // Dosya tipi kontrolü
                if (!file.ContentType.StartsWith("image/"))
                {
                    return BadRequest("Sadece resim dosyaları kabul edilir");
                }

                // Benzersiz dosya adı oluştur
                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(_environment.WebRootPath, "images", fileName);

                // Dosyayı kaydet
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // URL döndür
                var imageUrl = $"/images/{fileName}";
                
                return Ok(new { 
                    success = true, 
                    url = imageUrl, 
                    fileName = fileName 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    error = "Dosya yüklenirken hata oluştu: " + ex.Message 
                });
            }
        }

        [HttpDelete("delete/{fileName}")]
        public IActionResult Delete(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_environment.WebRootPath, "images", fileName);
                
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    return Ok(new { success = true, message = "Dosya silindi" });
                }
                
                return NotFound("Dosya bulunamadı");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    error = "Dosya silinirken hata oluştu: " + ex.Message 
                });
            }
        }
    }
}
