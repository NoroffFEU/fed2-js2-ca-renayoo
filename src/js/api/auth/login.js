document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementsByName("login")[0];

    if (!form) {
        console.error("Form with name 'login' not found.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Clear previous messages
        const errorMessages = document.getElementById("errorMessages");
        const successMessages = document.getElementById("successMessages");
        errorMessages.innerText = "";
        successMessages.innerText = "";

        // Form data
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Basic validation
        if (!email || !password) {
            errorMessages.innerText = "Both email and password are required.";
            return;
        }

        // Call login function
        try {
            await loginUser({ email, password });
        } catch (error) {
            errorMessages.innerText = "Error: " + error.message;
        }
    });
});


// Log in 
async function loginUser({ email, password }) {
    try {
        const response = await fetch("https://v2.api.noroff.dev/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        // Parse the response JSON
        const responseData = await response.json();

        // Log the entire response data to see its structure
        console.log('Login response data:', responseData);

        // Login ok or no? 
        if (response.status !== 200) {
            throw new Error(responseData.message || "Login failed. Please check your credentials.");
        }

        // Correctly extract the accessToken from the data property
        const accessToken = responseData.data.accessToken;  

        // Store the accessToken in localStorage
        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
            console.log('Access token saved to localStorage.');
        } else {
            console.error('Access token not found in response.');
        }

        // Optional: Redirect to feed and show login successful msg
        const successMessages = document.getElementById("successMessages");
        successMessages.innerText = "Logging in! Loading feed...";
        setTimeout(() => {
             window.location.href = "/";  // Redirect to feed or homepage
         }, 800);  // Delay for 0.8 seconds
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
}
