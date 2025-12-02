using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace webApp.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        public string Status { get; set; } = "Open";
        public string Priority { get; set; } = "Medium";
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string SubmittedBy { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? AssignedTechnician { get; set; }
        
        public List<TicketReply> Replies { get; set; } = new();
    }
}