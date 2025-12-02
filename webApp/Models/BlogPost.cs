using System.ComponentModel.DataAnnotations;
namespace webApp.Models
{
    public class BlogPost
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        public string Content { get; set; } = string.Empty;
        
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        
        [MaxLength(100)]
        public string Author { get; set; } = string.Empty;
    }
}