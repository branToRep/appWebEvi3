const API_BASE = 'http://localhost:5068/api';

//Store the current user email
let currentUserEmail = '';

//Submit new ticket
document.getElementById('ticketForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userEmail = document.getElementById('userEmail').value;
    if (!userEmail) {
        alert('Please enter your email first');
        return;
    }
    
    //Store the email for later use
    currentUserEmail = userEmail;

    const ticketData = {
        title: document.getElementById('ticketTitle').value,
        description: document.getElementById('ticketDescription').value,
        priority: document.getElementById('ticketPriority').value,
        submittedBy: userEmail
    };

    console.log('Submitting ticket:', ticketData);

    try {
        const response = await fetch(`${API_BASE}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData)
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Ticket created:', result);
            alert('Ticket submitted successfully!');
            
            //Only reset specific fields, keep the email
            document.getElementById('ticketTitle').value = '';
            document.getElementById('ticketDescription').value = '';
            document.getElementById('ticketPriority').value = 'Medium';
            
            //Load tickets using the stored email
            loadMyTickets();
        } else {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            alert('Error submitting ticket: ' + response.status);
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error submitting ticket');
    }
});

//Load user's tickets
async function loadMyTickets() {
    //Use the stored email if available, otherwise get from form
    const userEmail = currentUserEmail || document.getElementById('userEmail').value;
    
    if (!userEmail) {
        alert('Please enter your email first');
        return;
    }

    console.log('Loading tickets for:', userEmail);

    try {
        const response = await fetch(`${API_BASE}/tickets`);
        console.log('GET tickets response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tickets = await response.json();
        console.log('All tickets from server:', tickets);
        
        //Filter tickets for this user
        const userTickets = tickets.filter(ticket => ticket.submittedBy === userEmail);
        console.log('Filtered user tickets:', userTickets);
        
        displayMyTickets(userTickets);
    } catch (error) {
        console.error('Error loading tickets:', error);
        alert('Error loading tickets: ' + error.message);
    }
}

function displayMyTickets(tickets) {
    const container = document.getElementById('myTicketsContainer');
    container.innerHTML = '';

    if (tickets.length === 0) {
        container.innerHTML = '<p>No tickets found for your email.</p>';
        return;
    }

    tickets.forEach(ticket => {
        const ticketElement = document.createElement('div');
        ticketElement.className = `ticket status-${ticket.status.toLowerCase()}`;
        
        const replyCount = ticket.replies ? ticket.replies.length : 0;
        
        ticketElement.innerHTML = `
            <h3>${ticket.title} <span class="badge">${ticket.status}</span></h3>
            <p><strong>Priority:</strong> ${ticket.priority}</p>
            <p>${ticket.description}</p>
            <small>Submitted: ${new Date(ticket.createdDate).toLocaleString()}</small>
            ${ticket.assignedTechnician ? `<br><small><strong>Assigned to:</strong> ${ticket.assignedTechnician}</small>` : ''}
            
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
}

//Load tickets when email is entered and user presses Enter
document.getElementById('userEmail').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentUserEmail = document.getElementById('userEmail').value;
        loadMyTickets();
    }
});

//Also update currentUserEmail when the email field changes
document.getElementById('userEmail').addEventListener('input', (e) => {
    currentUserEmail = e.target.value;
});

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