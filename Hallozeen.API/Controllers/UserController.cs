using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Hallozeen.API.Repositories;
using Hallozeen.API.Data.DTO;

namespace Hallozeen.API.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;

        public UserController(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        [HttpGet]
        public async Task<ActionResult<UserDto>> GetUser()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            var user = await _authRepository.GetUserByUsernameAsync(username);
            if (user == null)
                return NotFound();

            var userDto = new UserDto
            {
                Username = user.Username,
                Email = user.Email
            };

            return Ok(userDto);
        }
    }
}