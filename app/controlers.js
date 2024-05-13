// Put your controller code here
exports.tes = (req, res) => {
    res.send("Agitha COD BOX Server");
};

exports.tes2 = (req, res) => {
    res.send("Agitha Server");
};

exports.view1 = (req, res) => {
    const data = {
        // layout: "coba1"
    }
    res.render("coba1", data);
};
