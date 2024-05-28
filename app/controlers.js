// Put your controller code here
exports.tes = (req, res) => {
    if (req.role == "SUPER ADMIN") res.redirect("/admin/transaksi/riwayat");
    if (req.role == "BASE") res.redirect("/user/transaksi/buat");
    // if (req.role == "KURIR") res.redirect("/user/transaksi/buat");
    res.send("Agitha COD BOX Server");
};

exports.tes2 = (req, res) => {
    res.send("Agitha Server");
};

exports.view1 = (req, res) => {
    const data = {
        // layout: "coba1"
    };
    res.render("coba1", data);
};
