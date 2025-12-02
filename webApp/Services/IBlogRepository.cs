using webApp.Models;

namespace webApp.Services
{
    public interface IBlogRepository
    {
        Task<IEnumerable<BlogPost>> GetAllPosts();
        Task<BlogPost?> GetPostById(int id);
        Task AddPost(BlogPost post);
    }
}