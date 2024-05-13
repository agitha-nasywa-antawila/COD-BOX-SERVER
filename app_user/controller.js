exports.userBuatPesanan = (req, res) => {
    const data ={
        layout: "layouts/user_base"
    }
    res.render("user_buat_pesanan", data);
}