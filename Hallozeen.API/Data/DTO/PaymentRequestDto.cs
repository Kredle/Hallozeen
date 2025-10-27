using System.Collections.Generic;

namespace Hallozeen.API.Data.DTO
{
    public class PaymentProductDto
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
    }

    public class PaymentCardDto
    {
        public string Number { get; set; } = string.Empty;
        public string CVV { get; set; } = string.Empty;
        public string Expiry { get; set; } = string.Empty;
    }

    public class PaymentRequestDto
    {
        public List<PaymentProductDto> Products { get; set; } = new();
        public PaymentCardDto Card { get; set; } = new();
    }
}