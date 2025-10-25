using Microsoft.AspNetCore.Mvc;
using Hallozeen.API.Repositories;
using Hallozeen.API.Data.DTO;
using AutoMapper;

namespace Hallozeen.API.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;

        public ProductsController(IProductRepository productRepository, IMapper mapper)
        {
            _productRepository = productRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProductDto>>> GetAll()
        {
            var products = await _productRepository.GetAllAsync();
            var result = products.Select(p =>
            {
                var dto = _mapper.Map<ProductDto>(p);
                dto.Cost = p.Cost;
                if (p.Cost == null)
                {
                    if (p.Name == "Captcha of The Dead")
                        dto.WeirdCostTitle = "100%";
                    else if (p.Name == "Scroll of Infinite Loop")
                        dto.WeirdCostTitle = "8/9";
                }
                return new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    ImageUrl = p.ImageUrl,
                    Cost = dto.Cost,
                    WeirdCostTitle = dto.WeirdCostTitle
                };
            }).ToList();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetById(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound();

            var dto = _mapper.Map<ProductDto>(product);
            dto.Cost = product.Cost;
            if (product.Cost == null)
            {
                if (product.Name == "Captcha of The Dead")
                    dto.WeirdCostTitle = "100%";
                else if (product.Name == "Scroll of Infinite Loop")
                    dto.WeirdCostTitle = "8/9";
            }
            return Ok(new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                Cost = dto.Cost,
                WeirdCostTitle = dto.WeirdCostTitle
            });
        }
    }
}