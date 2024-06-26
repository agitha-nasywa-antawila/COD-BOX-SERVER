exports.kurirAntarPesanan = (req, res) => {
    const data = {
        layout: "layouts/kurir_base",
        scripts: ["qrcode.min.js", "kurir_ambil_pesanan.js"],
    };
    res.render("kurir_antar_pesanan", data);
};
