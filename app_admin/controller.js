exports.adminRiwayatPesananPengguna = (req, res) => {
    console.log(req.username);

    const data = {
        layout: "layouts/admin_base",
    };
    res.render("admin_riwayat_pengguna", data);
};

exports.daftarPengguna = (req, res) => {
    const data = {
        layout: "layouts/admin_base",
        scripts: ["admin_daftar_pengguna.js"],
    };
    res.render("admin_daftar_pengguna", data);
};

exports.adminRiwayatDetail = (req, res) => {
    const data = {
        layout: "layouts/admin_base",
    };
    res.render("admin_riwayat_detail", data);
};
