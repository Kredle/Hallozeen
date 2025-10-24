namespace Hallozeen.API.Data.DTO
{
    public class RegisterRequestDTO
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword1 { get; set; } = string.Empty;
        public string ConfirmPassword2 { get; set; } = string.Empty;
    }
}