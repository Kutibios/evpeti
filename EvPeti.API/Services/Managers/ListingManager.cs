using EvPeti.API.Models;
using EvPeti.API.Services.DL;

namespace EvPeti.API.Services.Managers
{
    public class ListingManager
    {
        private readonly IListingDLService _listingDLService;

        public ListingManager(IListingDLService listingDLService)
        {
            _listingDLService = listingDLService;
        }

        public DataResult<IEnumerable<Listing>> GetAllListings()
        {
            try
            {
                var listings = _listingDLService.GetList();
                return new SuccessDataResult<IEnumerable<Listing>>(listings, "İlanlar başarıyla getirildi");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllListings: {ex.Message}");
                return new ErrorDataResult<IEnumerable<Listing>>(default(IEnumerable<Listing>), "İlanlar getirilirken hata oluştu: " + ex.Message);
            }
        }

        public DataResult<Listing?> GetListingById(int id)
        {
            try
            {
                if (id <= 0)
                    return new ErrorDataResult<Listing?>(default(Listing?), "Geçersiz ID");

                var listing = _listingDLService.Get(l => l.Id == id);
                if (listing == null)
                    return new ErrorDataResult<Listing?>(default(Listing?), "İlan bulunamadı");

                return new SuccessDataResult<Listing?>(listing, "İlan başarıyla getirildi");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetListingById: {ex.Message}");
                return new ErrorDataResult<Listing?>(default(Listing?), "İlan getirilirken hata oluştu: " + ex.Message);
            }
        }

        public DataResult<IEnumerable<Listing>> GetListingsByUserId(int userId)
        {
            try
            {
                if (userId <= 0)
                    return new ErrorDataResult<IEnumerable<Listing>>(default(IEnumerable<Listing>), "Geçersiz kullanıcı ID");

                var listings = _listingDLService.GetList(l => l.UserId == userId);
                return new SuccessDataResult<IEnumerable<Listing>>(listings, "Kullanıcı ilanları başarıyla getirildi");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetListingsByUserId: {ex.Message}");
                return new ErrorDataResult<IEnumerable<Listing>>(default(IEnumerable<Listing>), "Kullanıcı ilanları getirilirken hata oluştu: " + ex.Message);
            }
        }

        public DataResult<IEnumerable<Listing>> GetActiveListings()
        {
            try
            {
                var listings = _listingDLService.GetList(l => l.IsActive && l.IsAvailable);
                return new SuccessDataResult<IEnumerable<Listing>>(listings, "Aktif ilanlar başarıyla getirildi");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetActiveListings: {ex.Message}");
                return new ErrorDataResult<IEnumerable<Listing>>(default(IEnumerable<Listing>), "Aktif ilanlar getirilirken hata oluştu: " + ex.Message);
            }
        }
    }
}
