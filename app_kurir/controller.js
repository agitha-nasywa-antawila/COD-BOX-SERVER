exports.kurirAntarPesanan = (req, res) => {
    const data = {
        layout: "layouts/kurir_base",
    };
    res.render("kurir_antar_pesanan", data);
};
