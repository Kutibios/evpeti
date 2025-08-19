using EvPeti.API.Services.DL;

namespace EvPeti.API.Services.Managers
{
    public interface IDLServiceManager
    {
        IPetDLService PetDL { get; }
        IListingDLService ListingDL { get; }
    }
}
