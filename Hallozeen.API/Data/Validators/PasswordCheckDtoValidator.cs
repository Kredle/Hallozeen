using FluentValidation;
using Hallozeen.API.Data.DTO;

namespace Hallozeen.API.Data.Validators
{
    public class PasswordCheckDtoValidator : AbstractValidator<PasswordCheckDto>
    {
        public PasswordCheckDtoValidator()
        {
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long")
                .MaximumLength(20).WithMessage("Password must not exceed 20 characters long");
        }
    }
}