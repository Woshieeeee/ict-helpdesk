const form = document.getElementById("ticketForm");

form.addEventListener("submit", submitTicket);

function generateTicketNumber() {
    return "ICT-" + String(Date.now()).slice(-6);
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

    alert("Ticket Submitted Successfully!");
    form.reset();
}