using Hallozeen.API.Data.Models;

namespace Hallozeen.API.Repositories
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync();
        Task<Product?> GetByIdAsync(int id);
    }
}