exports.userBuatPesanan = (req, res) => {
    const data = {
        layout: "layouts/user_base",
        styles: ["/css/jquery-ui.css", "/css/jquery-custom.css"],
        scripts: [
            "util/jquery-3.7.1.min.js",
            "util/jquery-ui-1.13.2.min.js",
            "qrcode.min.js",
            "user_buat_pesanan.js",
        ],
    };
    res.render("user_buat_pesanan", data);
};
