document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementsByName("login")[0];

    if (!form) {
        console.error("Form with name 'login' not found.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

    // Clear previous messages
        document.getElementById("errorMessages").innerText = "";
        document.getElementById("successMessages").innerText = "";

    // Form data
        const formData = {
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim(),
    };

    // Basic validation
        if (!formData.email || !formData.password) {
        document.getElementById("errorMessages").innerText =
            "Both email and password are required.";
        return;
    }

    try {
        const response = await fetch("https://v2.api.noroff.dev/auth/login", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
        },
            body: JSON.stringify(formData),
        });

        const responseData = await response.json();

        // Log response for debugging
        console.log(responseData);

        // Handle failed login
        if (response.status !== 200) {
            throw new Error(responseData.message || "Login failed. Please check your credentials.");
        }

        // Handle successful login
        const accessToken = responseData.accessToken; // Assuming the token is called 'accessToken'

        // Save the token in localStorage
        localStorage.setItem("accessToken", accessToken);

        // Display success message
        document.getElementById("successMessages").innerText = "Login successful! Loading feed...";

        // Timer for loading feed
        setTimeout(() => {
            window.location.href = "/index.html";  
        }, 1000);  // Delay for 1.5 seconds 
    } catch (error) {
        console.error("Login failed:", error);
        document.getElementById("errorMessages").innerText = "Error: " + error.message;
        }
    });
});