using EvPeti.API.Services.DL;

namespace EvPeti.API.Services.Managers
{
    public class DLServiceManager : IDLServiceManager
    {
        public IPetDLService PetDL { get; }
        public IListingDLService ListingDL { get; }

        public DLServiceManager(
            IPetDLService petDL,
            IListingDLService listingDL)
        {
            PetDL = petDL;
            ListingDL = listingDL;
        }
    }
}
