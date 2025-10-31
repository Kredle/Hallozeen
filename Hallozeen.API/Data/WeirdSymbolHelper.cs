using System;
using System.Collections.Generic;

namespace Hallozeen.API.Data
{
    public static class WeirdSymbolHelper
    {
        private static readonly Dictionary<char, string> WeirdSymbols = new()
        {
            { '0', "𝟘̷̸͈͔͍͇͢͠͞" }, { '1', "𝟙̸̡̞̦͉̞̫" }, { '2', "ᘖ͞" }, { '3', "३͔̹͢" }, { '4', "𝟜̴̷̱̗" },
            { '5', "𝟝̶̛̻͉" }, { '6', "Ϭ̢̫͝" }, { '7', "𝟟̢̞̩͝" }, { '8', "ȣ̴̞̠͢" }, { '9', "९̵͓̲͝" }
        };

        public static string ToWeirdSymbols(int number)
        {
            var str = number.ToString();
            var result = "";
            foreach (var c in str)
            {
                result += WeirdSymbols.ContainsKey(c) ? WeirdSymbols[c] : c;
            }
            return result;
        }
    }
}