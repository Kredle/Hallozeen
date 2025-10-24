using FluentValidation;
using Hallozeen.API.Data.DTO;

namespace Hallozeen.API.Data.Validators
{
    public class LoginRequestDTOValidator : AbstractValidator<LoginRequestDTO>
    {
        public LoginRequestDTOValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("A valid summoning channel is required");
            RuleFor(x => x.Password).NotEmpty().WithMessage("A mystic incantation is required");
        }
    }
}