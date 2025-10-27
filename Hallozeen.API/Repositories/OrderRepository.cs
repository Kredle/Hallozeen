using Hallozeen.API.Data;
using Hallozeen.API.Data.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hallozeen.API.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _db;
        public OrderRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Order>> GetOrdersByUserIdAsync(int userId)
        {
            return await _db.Orders
                .Include(o => o.OrderProducts)
                .ThenInclude(op => op.Product)
                .Where(o => o.UserId == userId)
                .ToListAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(Guid orderId)
        {
            return await _db.Orders
                .Include(o => o.OrderProducts)
                .ThenInclude(op => op.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }
    }
}