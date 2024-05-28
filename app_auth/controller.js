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
    };
    res.render("auth_register", data);
};
