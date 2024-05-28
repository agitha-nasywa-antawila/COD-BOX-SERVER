const usernameForm = document.getElementById("username");
const passwordForm = document.getElementById("password");
const loginButton = document.getElementById("login-btn");

loginButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const usernameValue = String(usernameForm.value).trim();
    const passwordValue = String(passwordForm.value).trim();

    const response = await httpRequest({
        url: "/api/v1/user/login",
        method: "POST",
        body: {
            username: usernameValue,
            password: passwordValue,
        },
    });

    if (response.success) {
        // Redirect
        window.location = "/";
    } else {
        // Munculin Error
        alert(`${response.message}, password not match or user not register`);
    }

    console.log(response);
});
