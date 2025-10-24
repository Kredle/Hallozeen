using Hallozeen.API.Data.DTO;
using Hallozeen.API.Data.Models;

namespace Hallozeen.API.Repositories
{
    public interface IAuthRepository
    {
        Task<User?> GetUserByUsernameAsync(string username);
        Task<bool> IsUsernameTakenAsync(string username);
        Task<bool> IsEmailTakenAsync(string email);
        Task<User?> GetUserByPasswordAsync(string password);
        Task<User> CreateUserAsync(string username, string password, string email);
        Task<bool> ValidatePasswordAsync(User user, string password);
        Task<User?> GetUserByEmailAsync(string email);
    }
}