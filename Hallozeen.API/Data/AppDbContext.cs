using Microsoft.EntityFrameworkCore;
using Hallozeen.API.Data.Models;

namespace Hallozeen.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; } // Added

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.Property(u => u.Username)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.HasIndex(u => u.Username)
                    .IsUnique();

                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(30);

                entity.HasIndex(u => u.Email)
                    .IsUnique();

                entity.Property(u => u.Password)
                    .IsRequired();

                entity.HasIndex(u => u.Password)
                    .IsUnique();
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Name).IsRequired().HasMaxLength(100);
                entity.Property(p => p.Description).HasMaxLength(500);
                entity.Property(p => p.Cost);
            });
        }
    }
}