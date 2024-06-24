// Put your controller code here
exports.tes = (req, res) => {
    if (req.role == "SUPER ADMIN")
        return res.redirect("/admin/transaksi/riwayat");
    if (req.role == "BASE")
        return res.redirect("/user/transaksi/buat?payment=ONLINE");
    if (req.role == "KURIR") return res.redirect("/kurir/pesanan/antar");
    return res.send("Agitha COD BOX Server");
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
