exports.userBuatPesanan = (req, res) => {
    const data = {
        layout: "layouts/user_base",
        scripts: ["qrcode.min.js", "user_buat_pesanan.js"],
    };
    res.render("user_buat_pesanan", data);
};
