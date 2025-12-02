using Microsoft.AspNetCore.Mvc;
using webApp.Models;
using webApp.Services;

namespace webApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlogController : ControllerBase
    {
        private readonly IBlogRepository _blogRepository;

        public BlogController(IBlogRepository blogRepository)
        {
            _blogRepository = blogRepository;
        }

        //GET: api/blog
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BlogPost>>> GetPosts()
        {
            var posts = await _blogRepository.GetAllPosts();
            return Ok(posts);
        }

        //GET: api/blog/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BlogPost>> GetPost(int id)
        {
            var post = await _blogRepository.GetPostById(id);
            
            if (post == null)
            {
                return NotFound();
            }
            
            return Ok(post);
        }

        //POST: api/blog
        [HttpPost]
        public async Task<ActionResult<BlogPost>> CreatePost(BlogPost post)
        {
            if (string.IsNullOrWhiteSpace(post.Title))
            {
                return BadRequest("Title is required");
            }

            await _blogRepository.AddPost(post);
            
            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
        }
    }
}