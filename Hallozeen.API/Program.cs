using Hallozeen.API.Data;
using Hallozeen.API.Repositories;
using Hallozeen.API.Services;
using FluentValidation;
using Hallozeen.API.Data.DTO;
using Hallozeen.API.Data.Validators;
using Microsoft.EntityFrameworkCore;
using FluentValidation.AspNetCore;

namespace Hallozeen.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Register Fluent Validators
            builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestDTOValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestDTOValidator>();

            builder.Services.AddControllers().AddFluentValidation();
            builder.Services.AddOpenApi();


            var connectionString = builder.Configuration.GetConnectionString("HallozeenConnection");
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString));


            // Register JWTService
            builder.Services.AddSingleton(new JWTService(builder.Configuration["Jwt:Secret"]));

            // Register AuthRepository
            builder.Services.AddScoped<IAuthRepository, AuthRepository>();

            // Add JWT authentication
            builder.Services.AddAuthentication("Bearer")
                .AddJwtBearer("Bearer", options =>
                {
                    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                            System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]))
                    };
                });

            // Configure CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Localhost",
                    policy => {
                        policy.WithOrigins("https://lively-stone-0d170a803.2.azurestaticapps.net").AllowAnyHeader().AllowAnyMethod();
                    });
            });
            var app = builder.Build();

            app.UseCors("Localhost");

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}