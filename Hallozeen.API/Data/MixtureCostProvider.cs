using System;

namespace Hallozeen.API.Data
{
    public static class MixtureCostProvider
    {
        private static readonly object _lock = new();
        private static int? _mixtureCost = null;

        public static int GenerateNewCost()
        {
            lock (_lock)
            {
                var rnd = new Random();
                _mixtureCost = rnd.Next(1, 1000);
                return _mixtureCost.Value;
            }
        }

        public static int? GetCost()
        {
            return _mixtureCost;
        }
    }
}