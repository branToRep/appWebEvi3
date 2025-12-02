using webApp.Models;

namespace webApp.Services
{
    public interface IHelpdeskRepository
    {
        //Tickets
        Task<List<Ticket>> GetAllTicketsAsync();
        Task<Ticket?> GetTicketByIdAsync(int id);
        Task<Ticket> CreateTicketAsync(Ticket ticket);
        Task<Ticket> UpdateTicketAsync(Ticket ticket);
        Task<List<Ticket>> GetTicketsByStatusAsync(string status);
        Task<List<Ticket>> GetTicketsByUserAsync(string userEmail);
        
        //Replies
        Task<TicketReply> AddReplyAsync(TicketReply reply);
        Task<List<TicketReply>> GetRepliesForTicketAsync(int ticketId);
        
        //Tech actions
        Task<Ticket> AssignTechnicianAsync(int ticketId, string technicianName);
        Task<Ticket> UpdateTicketStatusAsync(int ticketId, string status);
        Task<List<Ticket>> GetTicketsAssignedToTechnicianAsync(string technicianName);
    }
}