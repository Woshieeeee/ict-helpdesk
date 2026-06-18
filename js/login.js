function loginAdmin() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "1234") {
        localStorage.setItem("isAdmin", "true");
        showLoginPopup("✅", "Success", "Login successful! Redirecting to dashboard...", "success");
        setTimeout(() => {
            window.location.href = "admin.html";
        }, 1000);
    } else {
        showLoginPopup("❌", "Login Failed", "Invalid login details. Please try again.", "error");
    }
}

function showLoginPopup(icon, title, message, type = "success") {
    // Create popup elements if they don't exist
    if (!document.getElementById("loginPopupOverlay")) {
        const overlay = document.createElement("div");
        overlay.id = "loginPopupOverlay";
        overlay.className = "popup-overlay";
        overlay.innerHTML = `
            <div class="popup-content">
                <div class="popup-icon" id="loginPopupIcon"></div>
                <div class="popup-title" id="loginPopupTitle"></div>
                <div class="popup-message" id="loginPopupMessage"></div>
                <button class="popup-button" id="loginPopupButton" onclick="closeLoginPopup()">OK</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Add styles
        if (!document.getElementById("popupStyles")) {
            const style = document.createElement("style");
            style.id = "popupStyles";
            style.textContent = `
                .popup-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 2000;
                    justify-content: center;
                    align-items: center;
                }

                .popup-overlay.show {
                    display: flex;
                }

                .popup-content {
                    background: white;
                    border-radius: 10px;
                    padding: 30px;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    animation: popupSlideIn 0.3s ease-out;
                    max-width: 400px;
                }

                @keyframes popupSlideIn {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .popup-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                }

                .popup-title {
                    font-size: 22px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #333;
                }

                .popup-message {
                    font-size: 16px;
                    color: #666;
                    margin-bottom: 20px;
                    line-height: 1.5;
                }

                .popup-button {
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: background 0.3s;
                }

                .popup-button:hover {
                    background: #45a049;
                }

                .popup-button.error {
                    background: #f44336;
                }

                .popup-button.error:hover {
                    background: #da190b;
                }
            `;
            document.head.appendChild(style);
        }
    }

    const overlay = document.getElementById("loginPopupOverlay");
    const popupIcon = document.getElementById("loginPopupIcon");
    const popupTitle = document.getElementById("loginPopupTitle");
    const popupMessage = document.getElementById("loginPopupMessage");
    const popupButton = document.getElementById("loginPopupButton");

    popupIcon.textContent = icon;
    popupTitle.textContent = title;
    popupMessage.textContent = message;

    popupButton.className = "popup-button";
    if (type === "error") {
        popupButton.classList.add("error");
    }

    overlay.classList.add("show");
}

function closeLoginPopup() {
    const overlay = document.getElementById("loginPopupOverlay");
    overlay.classList.remove("show");
}