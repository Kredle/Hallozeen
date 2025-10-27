using Microsoft.AspNetCore.Mvc;
using Hallozeen.API.Repositories;
using System.Security.Claims;
using Hallozeen.API.Data.Models;

namespace Hallozeen.API.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IAuthRepository _authRepository;

        public OrdersController(IOrderRepository orderRepository, IAuthRepository authRepository)
        {
            _orderRepository = orderRepository;
            _authRepository = authRepository;
        }

        [HttpGet]
        public async Task<ActionResult<List<object>>> GetUserOrders()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            var user = await _authRepository.GetUserByUsernameAsync(username);
            if (user == null)
                return Unauthorized();

            var orders = await _orderRepository.GetOrdersByUserIdAsync(user.Id);

            var result = orders.Select(o => new
            {
                o.Id,
                Products = o.OrderProducts.Select(op => new
                {
                    op.Product.Id,
                    op.Product.Name,
                    op.Product.Cost,
                    op.Product.ImageUrl,
                    Quantity = op.Quantity
                }).ToList()
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetOrderById(Guid id)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            var user = await _authRepository.GetUserByUsernameAsync(username);
            if (user == null)
                return Unauthorized();

            var order = await _orderRepository.GetOrderByIdAsync(id);
            if (order == null || order.UserId != user.Id)
                return NotFound();

            var result = new
            {
                order.Id,
                Products = order.OrderProducts.Select(op => new
                {
                    op.Product.Id,
                    op.Product.Name,
                    op.Product.Cost,
                    op.Product.ImageUrl,
                    Quantity = op.Quantity
                }).ToList()
            };

            return Ok(result);
        }
    }
}