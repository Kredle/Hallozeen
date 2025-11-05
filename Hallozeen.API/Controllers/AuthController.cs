using Microsoft.AspNetCore.Mvc;
using Hallozeen.API.Data.DTO;
using Hallozeen.API.Repositories;
using Hallozeen.API.Services;
using System.Collections.Concurrent;

namespace Hallozeen.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;
        private readonly JWTService _jwtService;

        private static int _guessedNumber = 0;
        private static DateTime _guessedTimestamp = DateTime.MinValue;
        private static readonly object _lock = new();

        private const string MathQuestion = "lim(n->inf, (24n^3-2n^2-15n-1)/(8n^3-2n^2-15n-1))";
        private const string MathAnswer = "3";

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

            var validSuffixes = new[] { "Wizzard", "Witch", "Sorcerer", "VibeCoder" };
            if (!validSuffixes.Any(suffix => dto.Username.EndsWith(suffix)))
                return BadRequest("Username must end with one of these: Wizzard, Witch, Sorcerer, VibeCoder");

            var existingUser = await _authRepository.GetUserByPasswordAsync(dto.Password);
            if (existingUser != null)
                return BadRequest($"This spell is already taken by {existingUser.Username}");

            var passwordCheck = await CheckPasswordInternal(dto.Password, updateGuess: false);
            if (passwordCheck is ObjectResult badResult && badResult.StatusCode == 400)
                return badResult;

            var user = await _authRepository.CreateUserAsync(dto.Username, dto.Password, dto.Email);
            var token = _jwtService.GenerateToken(user.Username);
            return Ok(new { token });
        }

        [HttpPost("check-password")]
        public async Task<IActionResult> CheckPassword([FromBody] PasswordCheckDto dto)
        {
            return await CheckPasswordInternal(dto.Password, updateGuess: true);
        }

        private async Task<IActionResult> CheckPasswordInternal(string password, bool updateGuess = true)
        {
            var existingUser = await _authRepository.GetUserByPasswordAsync(password);
            if (existingUser != null)
                return BadRequest($"This password is used by {existingUser.Username}");

            int guessedNumber;
            lock (_lock)
            {
                if (updateGuess && (_guessedTimestamp == DateTime.MinValue || (DateTime.UtcNow - _guessedTimestamp).TotalMinutes > 5))
                {
                    _guessedNumber = new Random().Next(1, 31);
                    _guessedTimestamp = DateTime.UtcNow;
                }
                guessedNumber = _guessedNumber;
            }

            var numStr = guessedNumber.ToString();

            // 3. Check if password starts with the answer
            if (!password.StartsWith(MathAnswer))
                return BadRequest($"Password must start with the answer to \"{MathQuestion}\"");

            // 4. Check if password ends with the guessed number
            if (!password.EndsWith(numStr))
            {
                // Try to extract the number at the end of the password
                var match = System.Text.RegularExpressions.Regex.Match(password, @"(\d+)$");
                if (!match.Success)
                    return BadRequest($"Password must end with the guessed number");

                int enteredNum = int.Parse(match.Value);
                if (enteredNum < guessedNumber)
                    return BadRequest("Guessed number is bigger than entered");
                if (enteredNum > guessedNumber)
                    return BadRequest("Guessed number is less than entered");
                return BadRequest($"Password must end with the guessed number");
            }

            return Ok(new { message = "OK" });
        }
    }
}