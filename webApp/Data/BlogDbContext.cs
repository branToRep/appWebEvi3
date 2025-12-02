using Microsoft.EntityFrameworkCore;
using webApp.Models;

namespace webApp.Data
{
    public class BlogDbContext : DbContext
    {
        public BlogDbContext(DbContextOptions<BlogDbContext> options) : base(options)
        {
        }

        public DbSet<BlogPost> BlogPosts { get; set; }

        //Helpdesk
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TicketReply> TicketReplies { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BlogPost>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Author).HasMaxLength(100);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<Ticket>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Status).HasMaxLength(20);
                entity.Property(e => e.Priority).HasMaxLength(20);
                entity.Property(e => e.SubmittedBy).IsRequired().HasMaxLength(100);
                entity.Property(e => e.AssignedTechnician).HasMaxLength(100);
                
                entity.HasMany(t => t.Replies)
                      .WithOne(r => r.Ticket)
                      .HasForeignKey(r => r.TicketId);
            });

            modelBuilder.Entity<TicketReply>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Message).IsRequired();
                entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(100);
            });
        }
    }
}
