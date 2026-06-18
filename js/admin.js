const isAdmin = localStorage.getItem("isAdmin");

if (isAdmin !== "true") {
    window.location.href = "login.html";
}

let lastTicketsData = null;
let autoRefreshInterval = null;

// Initial load
loadTickets();

// Auto-refresh every 3 seconds
function startAutoRefresh() {
    autoRefreshInterval = setInterval(loadTickets, 3000);
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// Start auto-refresh when page loads
startAutoRefresh();

// Stop auto-refresh when page unloads
window.addEventListener("beforeunload", stopAutoRefresh);

async function loadTickets() {
    try {
        const res = await fetch(BASE_URL, {
            headers: { "X-Master-Key": API_KEY }
        });

        const data = await res.json();
        let tickets = data.record.tickets || [];

        const search = document.getElementById("search").value.toLowerCase();
        const filter = document.getElementById("filterStatus").value;

        tickets = tickets.filter(t =>
            (filter === "All" || t.status === filter) &&
            (t.subject.toLowerCase().includes(search) ||
             t.fullname.toLowerCase().includes(search))
        );

        // Check if data has changed
        const ticketsJSON = JSON.stringify(tickets);
        if (lastTicketsData === ticketsJSON) {
            return; // No changes, don't re-render
        }
        lastTicketsData = ticketsJSON;

        renderStats(tickets);
        renderChart(tickets);

        const container = document.getElementById("tickets");
        container.innerHTML = "";

        tickets.reverse().forEach(t => {
            container.innerHTML += `
            <div class="card" id="ticket-${t.id}">
                <h3>${t.subject}</h3>
                <p><b>ID:</b> ${t.ticketNumber}</p>
                <p><b>Name:</b> ${t.fullname}</p>

                <p>
                    <b>Status:</b>
                    <span class="status ${t.status.toLowerCase().replace(" ", "-")}">
                        ${t.status}
                    </span>
                </p>

                <select onchange="updateStatus(${t.id}, this.value)">
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                </select>

                <button onclick="confirmDelete(${t.id})">Delete</button>
            </div>
            `;
        });

        // Show update indicator
        showUpdateNotification();

    } catch (error) {
        console.error("Error loading tickets:", error);
    }
}

function renderStats(tickets) {
    document.getElementById("stats").innerHTML = `
        <div class="card">
            <h2>Total: ${tickets.length}</h2>
        </div>
    `;
}

let chartInstance = null;

function renderChart(tickets) {
    const counts = {
        Pending: 0,
        "In Progress": 0,
        Resolved: 0,
        Closed: 0
    };

    tickets.forEach(t => counts[t.status]++);

    const chartCanvas = document.getElementById("chart");
    
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(chartCanvas, {
        type: "bar",
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: "Tickets",
                data: Object.values(counts),
                backgroundColor: ["#ff9800", "#2196F3", "#4CAF50", "#999"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

async function updateStatus(id, status) {
    try {
        const res = await fetch(BASE_URL, {
            headers: { "X-Master-Key": API_KEY }
        });

        const data = await res.json();
        let tickets = data.record.tickets;

        tickets = tickets.map(t => {
            if (t.id === id) t.status = status;
            return t;
        });

        await fetch(BASE_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify({ tickets })
        });

        // Reset lastTicketsData to force re-render
        lastTicketsData = null;
        loadTickets();
        showAdminPopup("✅", "Success", "Ticket status updated successfully!", "success");
    } catch (error) {
        console.error("Error updating status:", error);
        showAdminPopup("❌", "Error", "Error updating ticket status", "error");
    }
}

function confirmDelete(id) {
    showAdminPopup("⚠️", "Delete Ticket", "Are you sure you want to delete this ticket?", "warning", true, () => deleteTicket(id));
}

async function deleteTicket(id) {
    try {
        const res = await fetch(BASE_URL, {
            headers: { "X-Master-Key": API_KEY }
        });

        const data = await res.json();
        let tickets = data.record.tickets;

        tickets = tickets.filter(t => t.id !== id);

        await fetch(BASE_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify({ tickets })
        });

        // Reset lastTicketsData to force re-render
        lastTicketsData = null;
        loadTickets();
        showAdminPopup("✅", "Deleted", "Ticket deleted successfully!", "success");
    } catch (error) {
        console.error("Error deleting ticket:", error);
        showAdminPopup("❌", "Error", "Error deleting ticket", "error");
    }
}

// Show update notification
function showUpdateNotification() {
    const notif = document.getElementById("updateNotif");
    if (notif) {
        notif.style.display = "block";
        setTimeout(() => {
            notif.style.display = "none";
        }, 2000);
    }
}

function exportTickets() {
    const dataStr = "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(lastTicketsData));

    const link = document.createElement("a");
    link.href = dataStr;
    link.download = "tickets.json";
    link.click();
}

function logout() {
    stopAutoRefresh();
    localStorage.removeItem("isAdmin");
    window.location.href = "login.html";
}

// Add event listeners for search and filter to trigger immediate update
document.getElementById("search").addEventListener("change", () => {
    lastTicketsData = null;
    loadTickets();
});

document.getElementById("filterStatus").addEventListener("change", () => {
    lastTicketsData = null;
    loadTickets();
});

// Popup notification functions for admin dashboard
function showAdminPopup(icon, title, message, type = "success", showCancel = false, onConfirm = null) {
    const overlay = document.getElementById("popupOverlay");
    const popupIcon = document.getElementById("popupIcon");
    const popupTitle = document.getElementById("popupTitle");
    const popupMessage = document.getElementById("popupMessage");
    const popupButton = document.getElementById("popupButton");
    const popupCancelButton = document.getElementById("popupCancelButton");

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

    // Show/hide cancel button
    if (showCancel) {
        popupCancelButton.style.display = "block";
        popupButton.textContent = "Confirm";
        popupButton.onclick = () => {
            if (onConfirm) onConfirm();
            closeAdminPopup();
        };
        popupCancelButton.onclick = closeAdminPopup;
    } else {
        popupCancelButton.style.display = "none";
        popupButton.textContent = "OK";
        popupButton.onclick = closeAdminPopup;
    }

    overlay.classList.add("show");
}

function closeAdminPopup() {
    const overlay = document.getElementById("popupOverlay");
    overlay.classList.remove("show");
}
