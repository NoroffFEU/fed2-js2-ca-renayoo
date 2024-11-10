document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementsByName("login")[0];

    if (!form) {
        console.error("Form with name 'login' not found.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();  // Prevent form submission that appends data to the URL

        // Clear previous messages
        const errorMessages = document.getElementById("errorMessages");
        const successMessages = document.getElementById("successMessages");
        errorMessages.innerText = "";
        successMessages.innerText = "";

        // Get form data
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Basic form validation
        if (!email || !password) {
            errorMessages.innerText = "Both email and password are required.";
            return;
        }

        try {
            // Attempt login
            await loginUser({ email, password });
        } catch (error) {
            errorMessages.innerText = "Error: " + error.message;
        }
    });
});

// Function to handle login
async function loginUser({ email, password }) {
    try {
        console.log("Sending login request", { email, password });

        const response = await fetch("https://v2.api.noroff.dev/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),  // Send data as JSON
        });

        // Parse the response JSON
        const responseData = await response.json();

        if (response.status !== 200) {
            throw new Error(responseData.message || "Login failed. Please check your credentials.");
        }

        const accessToken = responseData.data.accessToken;
        if (accessToken) {
            // Store the access token and user data in localStorage
            localStorage.setItem("accessToken", accessToken);

            // Decode the JWT token
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
            const userId = tokenPayload.sub;  // Adjust based on your token structure
            const name = tokenPayload.name;   // Assuming 'name' is part of the payload

            localStorage.setItem('userId', userId);
            localStorage.setItem('name', name);  // Store user name in localStorage
        } else {
            console.error('Access token not found in response.');
        }

        // Show success message
        const successMessages = document.getElementById("successMessages");
        successMessages.innerText = "Logging in! Loading feed...";

        // Redirect after success with a small delay
        setTimeout(() => {
            window.location.href = "/";  // Redirect to the homepage or feed page
        }, 800);  // Delay for 0.8 seconds to show the success message

    } catch (error) {
        console.error("Login failed:", error);
        throw error;  // Re-throw the error to be caught in the form submission handler
    }
}
