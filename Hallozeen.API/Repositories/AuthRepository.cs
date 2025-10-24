using Hallozeen.API.Data;
using Hallozeen.API.Data.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Hallozeen.API.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _db;
        public AuthRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<bool> IsUsernameTakenAsync(string username)
        {
            return await _db.Users.AnyAsync(u => u.Username == username);
        }

        public async Task<bool> IsEmailTakenAsync(string email)
        {
            return await _db.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<User?> GetUserByPasswordAsync(string password)
        {
            var users = await _db.Users.ToListAsync();
            foreach (var user in users)
            {
                if (BCrypt.Net.BCrypt.Verify(password, user.Password))
                    return user;
            }
            return null;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> CreateUserAsync(string username, string password, string email)
        {
            var hashed = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User
            {
                Username = username,
                Email = email,
                Password = hashed
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return user;
        }

        public Task<bool> ValidatePasswordAsync(User user, string password)
        {
            return Task.FromResult(BCrypt.Net.BCrypt.Verify(password, user.Password));
        }
    }
}