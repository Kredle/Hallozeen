using Hallozeen.API.Data.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hallozeen.API.Repositories
{
    public interface IOrderRepository
    {
        Task<List<Order>> GetOrdersByUserIdAsync(int userId);
        Task<Order?> GetOrderByIdAsync(Guid orderId);
    }
}