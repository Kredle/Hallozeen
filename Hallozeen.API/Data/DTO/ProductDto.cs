namespace Hallozeen.API.Data.DTO
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double? Cost { get; set; }
        public string? WeirdCostTitle { get; set; }
        public string? ImageUrl { get; set; }
    }
}