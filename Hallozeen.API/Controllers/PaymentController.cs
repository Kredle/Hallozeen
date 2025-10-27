using Microsoft.AspNetCore.Mvc;
using Hallozeen.API.Data.DTO;
using Hallozeen.API.Data.Models;
using Hallozeen.API.Repositories;
using System.Security.Claims;
using Hallozeen.API.Data;

namespace Hallozeen.API.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IProductRepository _productRepository;
        private readonly IAuthRepository _authRepository;
        private readonly AppDbContext _db;

        // Hardcoded cards
        private static readonly List<Card> Cards = new()
        {
            new Card { Number = "4652349814587740", CVV = "004", Expiry = "10/27", Money = 1000 },
            new Card { Number = "4968887852987995", CVV = "020", Expiry = "10/26", Money = 800 },
            new Card { Number = "4073622494922458", CVV = "749", Expiry = "10/30", Money = 1200 },
            new Card { Number = "4516506418513353", CVV = "534", Expiry = "10/27", Money = 500 },
            new Card { Number = "4580774480726981", CVV = "332", Expiry = "10/28", Money = 1500 }
        };

        public PaymentController(IProductRepository productRepository, IAuthRepository authRepository, AppDbContext db)
        {
            _productRepository = productRepository;
            _authRepository = authRepository;
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> Pay([FromBody] PaymentRequestDto request)
        {
            var card = Cards.FirstOrDefault(c =>
                c.Number == request.Card.Number &&
                c.CVV == request.Card.CVV &&
                c.Expiry == request.Card.Expiry);

            if (card == null)
                return BadRequest("Invalid card");

            double total = 0;
            foreach (var item in request.Products)
            {
                var product = await _productRepository.GetByIdAsync(item.Id);
                if (product == null)
                    return BadRequest($"Product {item.Id} not found");

                if (product.Cost != null)
                {
                    total += product.Cost.Value * item.Quantity;
                }
                else if (product.Name == "Captcha of The Dead")
                {
                    total += card.Money * item.Quantity;
                }
                else if (product.Name == "Scroll of Infinite Loop")
                {
                    total += (card.Money * 8.0 / 9.0) * item.Quantity;
                }
                else
                {
                    return BadRequest($"Product {product.Name} has no cost and no special rule.");
                }
            }

            if (total > card.Money)
                return BadRequest("You are that poor?");

            card.Money -= total;

            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            var user = await _authRepository.GetUserByUsernameAsync(username);
            if (user == null)
                return Unauthorized();

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                OrderProducts = new List<OrderProduct>()
            };

            foreach (var item in request.Products)
            {
                order.OrderProducts.Add(new OrderProduct
                {
                    OrderId = order.Id,
                    ProductId = item.Id,
                    Quantity = item.Quantity
                });
            }

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            return Ok(new { orderId = order.Id, totalPaid = total });
        }
    }
}