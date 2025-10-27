namespace Hallozeen.API.Data.Models
{
    public class OrderProduct
    {
        public Guid OrderId { get; set; }
        public Order Order { get; set; } = null!;

        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int Quantity { get; set; }
    }
}