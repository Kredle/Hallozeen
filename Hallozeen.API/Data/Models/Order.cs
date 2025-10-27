using System;
using System.Collections.Generic;

namespace Hallozeen.API.Data.Models
{
    public class Order
    {
        public Guid Id { get; set; }
        public int UserId { get; set; }
        public List<OrderProduct> OrderProducts { get; set; } = new();
    }
}