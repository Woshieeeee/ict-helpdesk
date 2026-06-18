const isAdmin = localStorage.getItem("isAdmin");

if (isAdmin !== "true") {
    window.location.href = "login.html";
}

loadTickets();

async function loadTickets() {

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

    renderStats(tickets);
    renderChart(tickets);

    const container = document.getElementById("tickets");
    container.innerHTML = "";

    tickets.reverse().forEach(t => {

        container.innerHTML += `
        <div class="card">
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

            <button onclick="deleteTicket(${t.id})">Delete</button>
        </div>
        `;
    });
}

function renderStats(tickets) {
    document.getElementById("stats").innerHTML = `
        <div class="card">
            <h2>Total: ${tickets.length}</h2>
        </div>
    `;
}

function renderChart(tickets) {

    const counts = {
        Pending: 0,
        "In Progress": 0,
        Resolved: 0,
        Closed: 0
    };

    tickets.forEach(t => counts[t.status]++);

    new Chart(document.getElementById("chart"), {
        type: "bar",
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: "Tickets",
                data: Object.values(counts),
                backgroundColor: ["orange","blue","green","gray"]
            }]
        }
    });
}

async function updateStatus(id, status) {

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

    loadTickets();
}

async function deleteTicket(id) {

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

    loadTickets();
}

function exportTickets() {
    const dataStr = "data:text/json;charset=utf-8," +
        encodeURIComponent(localStorage.getItem("tickets"));

    const link = document.createElement("a");
    link.href = dataStr;
    link.download = "tickets.json";
    link.click();
}

function logout() {
    localStorage.removeItem("isAdmin");
    window.location.href = "login.html";
}