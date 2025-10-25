using Microsoft.AspNetCore.Mvc;
using Hallozeen.API.Data.DTO;
using Hallozeen.API.Repositories;
using Hallozeen.API.Services;


namespace Hallozeen.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;
        private readonly JWTService _jwtService;

        // Hardcoded math questions and answers
        private static readonly Dictionary<string, string> MathQuestions = new()
        {
            { "lim(n->inf, (24n^3-2n^2-15n-1)/(2n^3-2n^2-15n-1))", "12" },
            { "lim(n->0, x/sin(x))", "1" },
            { "f'(2), f(x) = x^2 + 3", "7" }
        };

        public AuthController(IAuthRepository authRepository, JWTService jwtService)
        {
            _authRepository = authRepository;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO dto)
        {
            var user = await _authRepository.GetUserByEmailAsync(dto.Email);
            if (user == null || !await _authRepository.ValidatePasswordAsync(user, dto.Password))
                return Unauthorized("Invalid credentials");

            var token = _jwtService.GenerateToken(user.Username);
            return Ok(new { token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDTO dto)
        {
            if (await _authRepository.IsUsernameTakenAsync(dto.Username))
                return BadRequest("This mortal name has been already used");

            if (await _authRepository.IsEmailTakenAsync(dto.Email))
                return BadRequest("This summoning channel has been already used");

            // Username suffix validation
            var validSuffixes = new[] { "Wizzard", "Witch", "Sorcerer", "VibeCoder" };
            if (!validSuffixes.Any(suffix => dto.Username.EndsWith(suffix)))
                return BadRequest("Username must end with one of these: Wizzard, Witch, Sorcerer, VibeCoder");

            // Check for unique password
            var existingUser = await _authRepository.GetUserByPasswordAsync(dto.Password);
            if (existingUser != null)
                return BadRequest($"This spell is already taken by {existingUser.Username}");

            // Pick a random math question
            var random = new Random();
            var question = MathQuestions.ElementAt(random.Next(MathQuestions.Count));

            // Check if password ends with the answer
            if (!dto.Password.EndsWith(question.Value))
                return BadRequest($"Your spell must finish with the answer to: {question.Key}");

            var user = await _authRepository.CreateUserAsync(dto.Username, dto.Password, dto.Email);
            var token = _jwtService.GenerateToken(user.Username);
            return Ok(new { token });
        }
    }
}