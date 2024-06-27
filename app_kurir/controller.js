exports.kurirAntarPesanan = (req, res) => {
    const data = {
        layout: "layouts/kurir_base",
        scripts: ["qrcode.min.js", "kurir_ambil_pesanan.js"],
    };
    res.render("kurir_antar_pesanan", data);
};

exports.kurirDaftarPesanan = (req, res) => {
    const data = {
        layout: "layouts/kurir_base",
        styles: [],
        scripts: ["kurir_daftar_pesanan.js"],
    };
    res.render("kurir_daftar_pesanan", data);
};

exports.kurirDetailPesanan = (req, res) => {
    const data = {
        layout: "layouts/kurir_base",
        styles: [],
        scripts: [
            "util/jquery-3.7.1.min.js",
            "util/jquery-ui-1.13.2.min.js",
            "qrcode.min.js",
            "kurir_detail_pesanan.js",
        ],
    };
    res.render("kurir_detail_pesanan", data);
};
