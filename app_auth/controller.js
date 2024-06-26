exports.login = (req, res) => {
    const data = {
        nama: "Agita",
        layout: "",
        scripts: ["auth_login.js"],
    };
    res.render("auth_login", data);
};

exports.register = (req, res) => {
    const data = {
        layout: "",
        scripts: ["auth_register.js"],
    };
    res.render("auth_register", data);
};

exports.logout = (req, res) => {
    res.cookie("Authorization", "", { maxAge: 1 });
    res.redirect("/auth/login");
};
