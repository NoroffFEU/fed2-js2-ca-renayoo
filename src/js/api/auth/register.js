// Register new account
export async function register({ name, email, password }) {
    try {
        const response = await fetch("https://v2.api.noroff.dev/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        });

        const responseData = await response.json();


        // Register ok or no?
        if (response.status !== 201) {
            throw new Error(responseData.message || "Unable to register user.");
        }

        // Return the successful response data
        return responseData;
    } catch (error) {
        console.error("There was a problem registering the user:", error);
        throw error; 
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementsByName("register")[0];

    if (!form) {
        console.error("Form with name 'register' not found.");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Clear previous messages
        document.getElementById("errorMessages").innerText = "";
        document.getElementById("successMessages").innerText = "";

        // Get form data
        const formData = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value.trim(),
        };

        // Form validation
        if (!formData.name || !formData.email || !formData.password) {
            document.getElementById("errorMessages").innerText = "All fields are required.";
            return;
        }

        try {
            const responseData = await register(formData);

            // Handle successful response
            document.getElementById("successMessages").innerText = "User registered successfully!";

            setTimeout(() => {
                window.location.href = "/auth/login/"; // Redirect to login
            }, 800); // 0.8 seconds
        } catch (error) {
            // Handle error
            document.getElementById("errorMessages").innerText = "Error: " + error.message;
        }
    });
});
