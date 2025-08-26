using EvPeti.API.Models;
using EvPeti.API.Services.DL;
using System.Linq.Expressions;

namespace EvPeti.API.Services.Managers
{
    public class PetManager
    {
        private readonly IPetDLService _petDal;

        public PetManager(IPetDLService petDal)
        {
            _petDal = petDal;
        }

        public DataResult<List<Pet>> GetAllPets()
        {
            try
            {
                var result = _petDal.GetList(); // IsActive kontrolünü geçici olarak kaldırdık

                if (result.Any())
                {
                    return new SuccessDataResult<List<Pet>>(result.ToList());
                }
                return new ErrorDataResult<List<Pet>>(null, "Bu kriterlere uygun veri bulunamadı.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAllPets Error: {ex.Message}");
                Console.WriteLine($"GetAllPets StackTrace: {ex.StackTrace}");
                Console.WriteLine($"GetAllPets InnerException: {ex.InnerException?.Message}");
                return new ErrorDataResult<List<Pet>>(null, $"Hata: {ex.Message}");
            }
        }

        public DataResult<Pet> GetPetById(int id)
        {
            try
            {
                var result = _petDal.Get(x => x.Id == id); // IsActive kontrolünü geçici olarak kaldırdık

                if (result != null)
                {
                    return new SuccessDataResult<Pet>(result);
                }
                return new ErrorDataResult<Pet>(null!, "Pet bulunamadı.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetPetById Error: {ex.Message}");
                return new ErrorDataResult<Pet>(null!, "Bir hata oluştu.");
            }
        }

        public DataResult<List<Pet>> GetPetsByUserId(int userId)
        {
            try
            {
                var result = _petDal.GetList(x => x.UserId == userId); // IsActive kontrolünü geçici olarak kaldırdık

                if (result.Any())
                {
                    return new SuccessDataResult<List<Pet>>(result.ToList());
                }
                return new ErrorDataResult<List<Pet>>(null, "Bu kullanıcıya ait pet bulunamadı.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetPetsByUserId Error: {ex.Message}");
                return new ErrorDataResult<List<Pet>>(null!, "Bir hata oluştu.");
            }
        }
    }
}
