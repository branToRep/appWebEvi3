using Microsoft.EntityFrameworkCore;
using webApp.Data;
using webApp.Models;

namespace webApp.Services
{
    public class BlogRepository : IBlogRepository
    {
        private readonly BlogDbContext _context;

        public BlogRepository(BlogDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BlogPost>> GetAllPosts()
        {
            return await _context.BlogPosts
                .OrderByDescending(p => p.CreatedDate)
                .ToListAsync();
        }

        public async Task<BlogPost?> GetPostById(int id)
        {
            return await _context.BlogPosts.FindAsync(id);
        }

        public async Task AddPost(BlogPost post)
        {
            post.CreatedDate = DateTime.Now;
            _context.BlogPosts.Add(post);
            await _context.SaveChangesAsync();
        }
    }
}