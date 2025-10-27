using FluentValidation;
using Hallozeen.API.Data.DTO;

namespace Hallozeen.API.Data.Validators
{
    public class RegisterRequestDTOValidator : AbstractValidator<RegisterRequestDTO>
    {

        public RegisterRequestDTOValidator()
        {
            RuleFor(x => x.Username).NotEmpty()
                .MinimumLength(3).WithMessage("Mortal name must be at least 3 characters long")
                .MaximumLength(20).WithMessage("Mortal name must not exceed 20 characters long");
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(30).WithMessage("Summoning channel must not exceed 30 characters long");
            RuleFor(x => x.Password).NotEmpty()
                .MinimumLength(8).WithMessage("Spell must be at least 8 characters long")
                .MaximumLength(20).WithMessage("Spell must not exceed 20 characters long");
            RuleFor(x => x.ConfirmPassword1).Equal(x => x.Password).WithMessage("Not all incantations match");
            RuleFor(x => x.ConfirmPassword2).Equal(x => x.Password).WithMessage("Not all incantations match");
        }
    }
}