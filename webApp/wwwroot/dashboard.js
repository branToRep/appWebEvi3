const API_BASE = 'http://localhost:5068/api';
let currentTicketId = null;
let currentTechName = '';

//Load all tickets
async function loadTickets() {
    const statusFilter = document.getElementById('statusFilter').value;
    let url = `${API_BASE}/tickets`;
    if (statusFilter) {
        url += `?status=${statusFilter}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const tickets = await response.json();
        displayTickets(tickets);
    } catch (error) {
        console.error('Error loading tickets:', error);
        alert('Error loading tickets: ' + error.message);
    }
}

//Load tickets assigned to current tech
async function loadMyTickets() {
    const techName = document.getElementById('techName').value;
    if (!techName) {
        alert('Please enter your name first');
        return;
    }
    currentTechName = techName;

    try {
        const response = await fetch(`${API_BASE}/tickets`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const allTickets = await response.json();
        const myTickets = allTickets.filter(ticket => ticket.assignedTechnician === techName);
        displayTickets(myTickets);
    } catch (error) {
        console.error('Error loading assigned tickets:', error);
        alert('Error loading assigned tickets: ' + error.message);
    }
}

function displayTickets(tickets) {
    const container = document.getElementById('ticketsContainer');
    container.innerHTML = '';

    if (tickets.length === 0) {
        container.innerHTML = '<p>No tickets found.</p>';
        return;
    }

    tickets.forEach(ticket => {
        const ticketElement = document.createElement('div');
        ticketElement.className = `ticket status-${ticket.status.toLowerCase()}`;
        
        ticketElement.innerHTML = `
            <div class="ticket-header">
                <h3>#${ticket.id} - ${ticket.title}</h3>
                <span class="status-badge ${ticket.status.toLowerCase()}">${ticket.status}</span>
            </div>
            <p><strong>From:</strong> ${ticket.submittedBy} | <strong>Priority:</strong> ${ticket.priority}</p>
            <p>${ticket.description}</p>
            <small>Created: ${new Date(ticket.createdDate).toLocaleString()} | 
                   ${ticket.updatedDate ? `Updated: ${new Date(ticket.updatedDate).toLocaleString()}` : ''}</small>
            ${ticket.assignedTechnician ? `<br><small><strong>Assigned to:</strong> ${ticket.assignedTechnician}</small>` : '<br><small><em>Unassigned</em></small>'}
            
            <div class="actions">
                ${!ticket.assignedTechnician ? `<button class="action-btn" onclick="assignToMe(${ticket.id})">Assign to Me</button>` : ''}
                <button class="action-btn reply-btn" data-ticket-id="${ticket.id}">Reply to Ticket</button>
                <select onchange="updateStatus(${ticket.id}, this.value)" class="status-select">
                    <option value="Open" ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
                    <option value="InProgress" ${ticket.status === 'InProgress' ? 'selected' : ''}>In Progress</option>
                    <option value="Resolved" ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    <option value="Closed" ${ticket.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>
            </div>
            
            <div class="replies">
                <h4>Replies (${ticket.replies?.length || 0})</h4>
                ${ticket.replies && ticket.replies.length > 0 ? 
                    ticket.replies.map(reply => `
                        <div class="reply">
                            <strong>${reply.createdBy}:</strong>
                            <p>${reply.message}</p>
                            <small>${new Date(reply.createdDate).toLocaleString()}</small>
                        </div>
                    `).join('') : 
                    '<p>No replies yet.</p>'
                }
            </div>
        `;
        
        container.appendChild(ticketElement);
    });

    //Add event listeners to all reply buttons
    document.querySelectorAll('.reply-btn').forEach(button => {
        button.addEventListener('click', function() {
            const ticketId = this.getAttribute('data-ticket-id');
            openReplyModal(parseInt(ticketId));
        });
    });
}

//Tech actions
async function assignToMe(ticketId) {
    const techName = document.getElementById('techName').value;
    if (!techName) {
        alert('Please enter your name first');
        return;
    }
    currentTechName = techName;

    try {
        const response = await fetch(`${API_BASE}/tickets/${ticketId}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(techName)
        });

        if (response.ok) {
            alert('Ticket assigned to you!');
            loadTickets();
        } else {
            const errorText = await response.text();
            alert('Error assigning ticket: ' + errorText);
        }
    } catch (error) {
        console.error('Error assigning ticket:', error);
        alert('Error assigning ticket: ' + error.message);
    }
}

async function updateStatus(ticketId, status) {
    const techName = document.getElementById('techName').value;
    if (!techName) {
        alert('Please enter your name first');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(status)
        });

        if (response.ok) {
            console.log(`Ticket ${ticketId} status updated to ${status}`);
            loadTickets();
        } else {
            const errorText = await response.text();
            alert('Error updating status: ' + errorText);
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status: ' + error.message);
    }
}

//Reply modal functions
function openReplyModal(ticketId) {
    console.log('Opening reply modal for ticket:', ticketId);
    
    const techName = document.getElementById('techName').value;
    if (!techName) {
        alert('Please enter your name first');
        return;
    }
    
    currentTechName = techName;
    currentTicketId = ticketId;
    
    const modal = document.getElementById('replyModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('replyMessage').focus();
    } else {
        console.error('Reply modal not found');
    }
}

function closeModal() {
    const modal = document.getElementById('replyModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentTicketId = null;
    document.getElementById('replyMessage').value = '';
}


async function submitReply() {
    const message = document.getElementById('replyMessage').value;
    
    if (!currentTechName) {
        alert('Please enter your name first');
        return;
    }

    if (!message.trim()) {
        alert('Please enter a reply message');
        return;
    }

    if (!currentTicketId) {
        alert('No ticket selected for reply');
        return;
    }

    console.log('Submitting reply for ticket:', currentTicketId);

    const requestData = {
        message: message,
        createdBy: currentTechName
    };

    console.log('Sending data:', requestData);

    try {
        const response = await fetch(`${API_BASE}/tickets/${currentTicketId}/replies`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
            const newReply = await response.json();
            console.log('Reply submitted successfully:', newReply);
            alert('Reply sent successfully!');
            closeModal();
            loadTickets();
        } else {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            alert('Error submitting reply: ' + errorText);
        }
    } catch (error) {
        console.error('Network error submitting reply:', error);
        alert('Network error submitting reply: ' + error.message);
    }
}


//Close modal when clicking outside or pressing Escape
window.onclick = function(event) {
    const modal = document.getElementById('replyModal');
    if (event.target === modal) {
        closeModal();
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

//Load tickets when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTickets();
    
    //Add enter key support for tech name
    document.getElementById('techName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loadTickets();
        }
    });
});

async function loadRepliesForTicket(ticketId) {
    try {
        const response = await fetch(`${API_BASE}/tickets/${ticketId}/replies`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error loading replies:', error);
        return [];
    }
}

function displayTickets(tickets) {
    const container = document.getElementById('ticketsContainer');
    container.innerHTML = '';

    if (tickets.length === 0) {
        container.innerHTML = '<p>No tickets found.</p>';
        return;
    }

    tickets.forEach(ticket => {
        const ticketElement = document.createElement('div');
        ticketElement.className = `ticket status-${ticket.status.toLowerCase()}`;
        
        const replyCount = ticket.replies ? ticket.replies.length : 0;
        
        ticketElement.innerHTML = `
            <div class="ticket-header">
                <h3>#${ticket.id} - ${ticket.title}</h3>
                <span class="status-badge ${ticket.status.toLowerCase()}">${ticket.status}</span>
            </div>
            <p><strong>From:</strong> ${ticket.submittedBy} | <strong>Priority:</strong> ${ticket.priority}</p>
            <p>${ticket.description}</p>
            <small>Created: ${new Date(ticket.createdDate).toLocaleString()} | 
                   ${ticket.updatedDate ? `Updated: ${new Date(ticket.updatedDate).toLocaleString()}` : ''}</small>
            ${ticket.assignedTechnician ? `<br><small><strong>Assigned to:</strong> ${ticket.assignedTechnician}</small>` : '<br><small><em>Unassigned</em></small>'}
            
            <div class="actions">
                ${!ticket.assignedTechnician ? `<button class="action-btn" onclick="assignToMe(${ticket.id})">Assign to Me</button>` : ''}
                <button class="action-btn reply-btn" data-ticket-id="${ticket.id}">Reply to Ticket</button>
                <select onchange="updateStatus(${ticket.id}, this.value)" class="status-select">
                    <option value="Open" ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
                    <option value="InProgress" ${ticket.status === 'InProgress' ? 'selected' : ''}>In Progress</option>
                    <option value="Resolved" ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    <option value="Closed" ${ticket.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>
            </div>
            
            <div class="replies-section">
                <div class="replies-header">
                    <button id="toggle-${ticket.id}" class="toggle-btn" onclick="toggleReplies(${ticket.id})">
                        ${replyCount > 0 ? `Show Replies (${replyCount})` : 'No Replies'}
                    </button>
                </div>
                <div id="replies-${ticket.id}" class="replies-container" style="display: none;">
                    ${ticket.replies && ticket.replies.length > 0 ? 
                        ticket.replies.map(reply => `
                            <div class="reply">
                                <strong>${reply.createdBy}:</strong>
                                <p>${reply.message}</p>
                                <small>${new Date(reply.createdDate).toLocaleString()}</small>
                            </div>
                        `).join('') : 
                        '<p>No replies yet.</p>'
                    }
                </div>
            </div>
        `;
        
        container.appendChild(ticketElement);
    });

    //Add event listeners to reply buttons
    document.querySelectorAll('.reply-btn').forEach(button => {
        button.addEventListener('click', function() {
            const ticketId = this.getAttribute('data-ticket-id');
            openReplyModal(parseInt(ticketId));
        });
    });
}

function toggleReplies(ticketId) {
    const repliesContainer = document.getElementById(`replies-${ticketId}`);
    const toggleButton = document.getElementById(`toggle-${ticketId}`);
    
    if (repliesContainer.style.display === 'none') {
        repliesContainer.style.display = 'block';
        toggleButton.textContent = 'Hide Replies';
    } else {
        repliesContainer.style.display = 'none';
        toggleButton.textContent = 'Show Replies';
    }
}