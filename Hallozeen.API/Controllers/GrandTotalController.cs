using Hallozeen.API.Data;
using Hallozeen.API.Data.DTO;
using Hallozeen.API.Data.Models;
using Hallozeen.API.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Hallozeen.API.Controllers
{
    [ApiController]
    [Route("api/total")]
    public class GrandTotalController : ControllerBase
    {
        private readonly IProductRepository _productRepository;

        // Copy the hardcoded cards from PaymentController
        private static readonly List<Card> Cards = new()
        {
            new Card { Number = "4652349814587740", CVV = "004", Expiry = "10/27", Money = 20000 },
            new Card { Number = "4968887852987995", CVV = "020", Expiry = "10/26", Money = 1800 },
            new Card { Number = "4073622494922458", CVV = "749", Expiry = "10/30", Money = 1200 },
            new Card { Number = "4516506418513353", CVV = "534", Expiry = "10/27", Money = 500 },
            new Card { Number = "4580774480726981", CVV = "332", Expiry = "10/28", Money = 1500 }
        };

        public GrandTotalController(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public class GrandTotalRequestDTO
        {
            public List<PaymentProductDto> Products { get; set; } = new();
            public PaymentCardDto Card { get; set; } = new();
        }

        [HttpPost]
        public async Task<ActionResult<double>> GetGrandTotal([FromBody] GrandTotalRequestDTO request)
        {
            // Find the card by details
            var card = Cards.FirstOrDefault(c =>
                c.Number == request.Card.Number &&
                c.CVV == request.Card.CVV &&
                c.Expiry == request.Card.Expiry);

            if (card == null)
                return BadRequest("Invalid card");

            double cardMoney = card.Money;
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
                    total += cardMoney * item.Quantity;
                }
                else if (product.Name == "Scroll of Infinite Loop")
                {
                    total += (cardMoney * 8.0 / 9.0) * item.Quantity;
                }
                else if (product.Name == "Technical Toxin")
                {
                    total += ((500.0 / 6.0) * 0.9) * item.Quantity;
                }
                else if (product.Name == "Mixture of a Thousand Tasks" && MixtureCostProvider.GetCost() != null)
                {
                    total += MixtureCostProvider.GetCost()!.Value * item.Quantity;
                }
            }

            return Ok(new { grandTotal = total });
        }
    }
}