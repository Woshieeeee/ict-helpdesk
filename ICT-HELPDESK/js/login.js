function loginAdmin() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "1234") {
        localStorage.setItem("isAdmin", "true");
        window.location.href = "admin.html";
    } else {
        document.getElementById("msg").innerText =
        "Invalid login details";
    }
}