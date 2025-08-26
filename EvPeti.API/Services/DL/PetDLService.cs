using EvPeti.API.Data;
using EvPeti.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace EvPeti.API.Services.DL
{
    public class PetDLService : IPetDLService
    {
        private readonly EvPetiDbContext _context;

        public PetDLService(EvPetiDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Pet>> GetAllAsync()
        {
            return await _context.Pets
                .Include(p => p.User)
                .ToListAsync();
        }

        public async Task<Pet?> GetByIdAsync(int id)
        {
            return await _context.Pets
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Pet>> GetByUserIdAsync(int userId)
        {
            return await _context.Pets
                .Where(p => p.UserId == userId)
                .Include(p => p.User)
                .ToListAsync();
        }

        public async Task<Pet> CreateAsync(Pet pet)
        {
            pet.CreatedAt = DateTime.UtcNow;
            pet.User = null; // Navigation property'yi null yap
            
            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();
            
            return pet;
        }

        public async Task<Pet> UpdateAsync(int id, Pet pet)
        {
            var existingPet = await _context.Pets.FindAsync(id);
            if (existingPet == null)
                throw new InvalidOperationException($"Pet with ID {id} not found");

            // Update fields
            existingPet.Name = pet.Name;
            existingPet.Type = pet.Type;
            existingPet.Breed = pet.Breed;
            existingPet.Age = pet.Age;
            existingPet.Gender = pet.Gender;
            existingPet.Weight = pet.Weight;
            existingPet.HealthNotes = pet.HealthNotes;
            existingPet.Photo = pet.Photo;

            await _context.SaveChangesAsync();
            return existingPet;
        }

        public async Task DeleteAsync(int id)
        {
            var pet = await _context.Pets.FindAsync(id);
            if (pet != null)
            {
                _context.Pets.Remove(pet);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Pets.AnyAsync(p => p.Id == id);
        }

        // Mentor'umuzun önerdiği yeni metodlar
        public IEnumerable<Pet> GetList(Expression<Func<Pet, bool>> filter = null)
        {
            var query = _context.Pets.AsQueryable();
            
            if (filter != null)
            {
                query = query.Where(filter);
            }
            
            return query.Include(p => p.User).ToList();
        }

        public Pet Get(Expression<Func<Pet, bool>> filter)
        {
            return _context.Pets
                .Include(p => p.User)
                .FirstOrDefault(filter);
        }
    }
}
