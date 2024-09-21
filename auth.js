// Replace these with the actual credentials for admin login
const adminCredentials = {
    username: "admin",
    password: "password123"
};

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Check if the username and password match the admin credentials
    if (username === adminCredentials.username && password === adminCredentials.password) {
        // Redirect to admin page
        window.location.href = "news-form.html";
    } else {
        // Show error message
        errorMessage.style.display = 'block';
    }
});
