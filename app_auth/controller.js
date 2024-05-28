exports.login = (req, res) => {
    const data = {
        layout: "",
    };
    res.render("auth_login", data);
};

exports.register = (req, res) => {
    const data = {
        layout: "",
    };
    res.render("auth_register", data);
};
