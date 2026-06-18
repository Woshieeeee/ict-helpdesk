const form = document.getElementById("ticketForm");

form.addEventListener("submit", submitTicket);

let lastSubmittedTicketId = null;
let submissionStatus = null;
let trackerPollInterval = null;

function generateTicketNumber() {
    // Get current ticket counter from localStorage
    let ticketCounter = parseInt(localStorage.getItem("ticketCounter")) || 1;
    
    // Format the number with leading zeros (001-500)
    const formattedNumber = String(ticketCounter).padStart(3, '0');
    const ticketNumber = "ICT-" + formattedNumber;
    
    // Increment counter and reset if reached 500
    ticketCounter++;
    if (ticketCounter > 500) {
        ticketCounter = 1;
    }
    
    // Save updated counter to localStorage
    localStorage.setItem("ticketCounter", ticketCounter);
    
    return ticketNumber;
}

async function submitTicket(e) {
    e.preventDefault();

    const newTicket = {
        id: Date.now(),
        ticketNumber: generateTicketNumber(),
        fullname: fullname.value,
        email: email.value,
        department: department.value,
        subject: subject.value,
        category: category.value,
        priority: priority.value,
        description: description.value,
        status: "Pending",
        createdAt: new Date().toLocaleString()
    };

    try {
        const res = await fetch(BASE_URL, {
            headers: { "X-Master-Key": API_KEY }
        });

        const data = await res.json();
        let tickets = data.record.tickets || [];

        tickets.push(newTicket);

        await fetch(BASE_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify({ tickets })
        });

        document.getElementById("notifySound").play();

        lastSubmittedTicketId = newTicket.id;
        submissionStatus = newTicket;

        showSuccessMessage(newTicket.ticketNumber);
        displayTicketTracker(newTicket);
        form.reset();

        // Start polling for real-time status updates
        startTrackerPolling(newTicket.id, newTicket.ticketNumber);

    } catch (error) {
        console.error("Error submitting ticket:", error);
        showPopup("❌", "Error", "Error submitting ticket. Please try again.", "error");
    }
}

function showSuccessMessage(ticketNumber) {
    showPopup("✅", "Thank You!", `Thank you for submitting a request! Your Ticket ${ticketNumber} has been successfully created. We will assist you sooner. You can track its status below.`, "success");
}

function displayTicketTracker(ticket) {
    document.getElementById("trackerTicketNum").textContent = ticket.ticketNumber;
    document.getElementById("trackerSubject").textContent = ticket.subject;
    updateTrackerStatus(ticket.status);
    document.getElementById("trackerTime").textContent = "Last updated: now";
    
    const tracker = document.getElementById("ticketTracker");
    tracker.classList.add("show");
}

function updateTrackerStatus(status) {
    const statusElement = document.getElementById("trackerStatus");
    const statusClass = "status-" + status.toLowerCase().replace(" ", "-");
    statusElement.className = "status-badge " + statusClass;
    statusElement.textContent = status;
}

function startTrackerPolling(ticketId, ticketNumber) {
    if (trackerPollInterval) {
        clearInterval(trackerPollInterval);
    }

    trackerPollInterval = setInterval(async () => {
        try {
            const res = await fetch(BASE_URL, {
                headers: { "X-Master-Key": API_KEY }
            });

            const data = await res.json();
            let tickets = data.record.tickets || [];
            const ticket = tickets.find(t => t.id === ticketId);

            if (ticket) {
                updateTrackerStatus(ticket.status);
                document.getElementById("trackerTime").textContent = 
                    "Last updated: " + new Date().toLocaleTimeString();

                // Show notification if status changed
                if (ticket.status !== submissionStatus.status) {
                    notifyStatusChange(ticket);
                    submissionStatus.status = ticket.status;
                }

                // Stop polling if resolved or closed
                if (ticket.status === "Resolved" || ticket.status === "Closed") {
                    clearInterval(trackerPollInterval);
                }
            }
        } catch (error) {
            console.error("Error polling for ticket:", error);
        }
    }, 4000);

    // Stop polling after 1 hour
    setTimeout(() => {
        if (trackerPollInterval) {
            clearInterval(trackerPollInterval);
        }
    }, 3600000);
}

function notifyStatusChange(ticket) {
    const message = document.createElement("div");
    message.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: bold;
    `;
    message.textContent = `📢 Your ticket ${ticket.ticketNumber} status changed to: ${ticket.status}`;
    document.body.appendChild(message);

    document.getElementById("notifySound").play();

    setTimeout(() => {
        message.style.opacity = "0";
        message.style.transition = "opacity 0.3s";
        setTimeout(() => message.remove(), 300);
    }, 5000);
}

function showPopup(icon, title, message, type = "success") {
    const overlay = document.getElementById("popupOverlay");
    const popupIcon = document.getElementById("popupIcon");
    const popupTitle = document.getElementById("popupTitle");
    const popupMessage = document.getElementById("popupMessage");
    const popupButton = document.getElementById("popupButton");

    popupIcon.textContent = icon;
    popupTitle.textContent = title;
    popupMessage.textContent = message;

    // Update button color based on type
    popupButton.className = "popup-button";
    if (type === "error") {
        popupButton.classList.add("error");
    } else if (type === "warning") {
        popupButton.classList.add("warning");
    }

    overlay.classList.add("show");
}

function closePopup() {
    const overlay = document.getElementById("popupOverlay");
    overlay.classList.remove("show");
}