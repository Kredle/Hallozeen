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
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderProduct> OrderProducts { get; set; }

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

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(o => o.Id);
                entity.Property(o => o.UserId).IsRequired(); // Added
                entity.HasOne<User>()
                    .WithMany()
                    .HasForeignKey(o => o.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<OrderProduct>(entity =>
            {
                entity.HasKey(op => new { op.OrderId, op.ProductId });
                entity.Property(op => op.Quantity).IsRequired();

                entity.HasOne(op => op.Order)
                    .WithMany(o => o.OrderProducts)
                    .HasForeignKey(op => op.OrderId);

                entity.HasOne(op => op.Product)
                    .WithMany()
                    .HasForeignKey(op => op.ProductId);
            });
        }
    }
}