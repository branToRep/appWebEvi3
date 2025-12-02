using System.ComponentModel.DataAnnotations;

namespace webApp.Models
{
    public class AddReplyRequest
    {
        [Required]
        public string Message { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string CreatedBy { get; set; } = string.Empty;
    }
}