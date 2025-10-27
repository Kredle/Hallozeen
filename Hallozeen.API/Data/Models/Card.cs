namespace Hallozeen.API.Data.Models
{
    public class Card
    {
        public string Number { get; set; } = string.Empty;
        public string CVV { get; set; } = string.Empty;
        public string Expiry { get; set; } = string.Empty;
        public double Money { get; set; }
    }
}