const usernameForm = document.getElementById("username");
const emailForm = document.getElementById("email");
const passwordForm = document.getElementById("password");
const registerButton = document.getElementById("register-button");

registerButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const usernameValue = String(usernameForm.value).trim();
    const passwordValue = String(passwordForm.value).trim();
    const emailValue = String(emailForm.value).trim();

    const response = await httpRequest({
        url: "/api/v1/user/register",
        method: "POST",
        body: {
            username: usernameValue,
            password: passwordValue,
            email: emailValue,
        },
    });
    if (response.success) {
        // Redirect
        window.location = "/";
    } else {
        // Munculin Error
        if (response?.errors?.Form) {
            for (let i = 0; i < response.errors.Form.detail.length; i++) {
                alert(response.errors.Form.detail[i].detail);
            }
        }

        if (response?.errors?.username) {
            alert(response.errors.username.detail);
        }
    }
});
