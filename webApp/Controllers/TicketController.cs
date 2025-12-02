using Microsoft.AspNetCore.Mvc;
using webApp.Models;
using webApp.Services;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly IHelpdeskRepository _repository;

    public TicketsController(IHelpdeskRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<List<Ticket>>> GetTickets(string? status = null)
    {
        if (!string.IsNullOrEmpty(status))
            return Ok(await _repository.GetTicketsByStatusAsync(status));
        
        return Ok(await _repository.GetAllTicketsAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Ticket>> GetTicket(int id)
    {
        var ticket = await _repository.GetTicketByIdAsync(id);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpPost]
    public async Task<ActionResult<Ticket>> CreateTicket(Ticket ticket)
    {
        var created = await _repository.CreateTicketAsync(ticket);
        return CreatedAtAction(nameof(GetTicket), new { id = created.Id }, created);
    }
    [HttpGet("assigned/{technician}")]
    public async Task<ActionResult<List<Ticket>>> GetTicketsAssignedToTechnician(string technician)
    {
        var tickets = await _repository.GetTicketsAssignedToTechnicianAsync(technician);
        return Ok(tickets);
    }
    [HttpPut("{id}/assign")]
    public async Task<ActionResult<Ticket>> AssignTechnician(int id, [FromBody] string technician)
    {
        var ticket = await _repository.AssignTechnicianAsync(id, technician);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<Ticket>> UpdateStatus(int id, [FromBody] string status)
    {
        var ticket = await _repository.UpdateTicketStatusAsync(id, status);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpPost("{ticketId}/replies")]
    public async Task<ActionResult<TicketReply>> AddReply(int ticketId, [FromBody] AddReplyRequest request)
    {
        try
        {
            Console.WriteLine($"Received reply request for ticket {ticketId}");
            Console.WriteLine($"Message: {request.Message}");
            Console.WriteLine($"CreatedBy: {request.CreatedBy}");

            //Validate the ticket exists
            var ticket = await _repository.GetTicketByIdAsync(ticketId);
            if (ticket == null)
            {
                return NotFound($"Ticket with ID {ticketId} not found");
            }

            //Create the TicketReply entity
            var reply = new TicketReply
            {
                Message = request.Message,
                CreatedBy = request.CreatedBy,
                TicketId = ticketId,
                CreatedDate = DateTime.Now
            };

            var created = await _repository.AddReplyAsync(reply);
            return Ok(created);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error adding reply: {ex.Message}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }


    [HttpGet("{ticketId}/replies")]
    public async Task<ActionResult<List<TicketReply>>> GetReplies(int ticketId)
    {
        var replies = await _repository.GetRepliesForTicketAsync(ticketId);
        return Ok(replies);
    }
}