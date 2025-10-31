using AutoMapper;
using Hallozeen.API.Data.Models;
using Hallozeen.API.Data.DTO;

namespace Hallozeen.API.Data
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.WeirdCostTitle, opt => opt.MapFrom(src =>
                    src.Cost == null
                        ? src.Name == "Captcha of The Dead" ? "100%" :
                          src.Name == "Scroll of Infinite Loop" ? "8/9" :
                          src.Name == "Technical Toxin" ? "(500/6)*0.9" : null
                        : null))
                .ForMember(dest => dest.Cost, opt => opt.MapFrom(src =>
                    src.Cost != null ? src.Cost : null));
        }
    }
}