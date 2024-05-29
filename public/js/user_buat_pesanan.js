const codBoxForm = document.getElementById("cod_box");
const nomorResiForm = document.getElementById("nomor_resi");
const nomorPesananForm = document.getElementById("nomor_pesanan");
const biayaForm = document.getElementById("biaya");
const tipePembayaranForm = document.getElementById("tipe_pembayaran");
const saveButton = document.getElementById("simpan");
const container = document.getElementById("container");

let storeNomorResi, storeNomorPesanan;

function handleCod(e) {
    const tipePembayaran = document
        .getElementById("tipe_pembayaran")
        .value.trim();

    const forCod = document.querySelectorAll(".for-cod");
    for (let i = 0; i < forCod.length; i++) {
        const element = forCod[i];
        if (tipePembayaran === "COD") {
            element.classList.add("inline-flex");
            element.classList.remove("hidden");
        }

        if (tipePembayaran === "ONLINE") {
            element.classList.remove("inline-flex");
            element.classList.add("hidden");
        }
    }
}

function showQRForOpenBox() {
    return `
        <h1 class="text-xl mb-4 text-center text-purple-700 font-semibold">QR CODE</h1>
        <p class="text-center mb-8 w-64 md:w-96 mx-auto text-slate-600">Gunakan QR Code Berikut untuk membuka <span id='qr-title'>box penyimpanan barang</span></p>

        <div id="qr-container" class="aspect-square mb-4 mx-auto w-64 border rounded-md overflow-hidden">Loading QR</div>

        <div class="w-64 md:w-96 mx-auto bg-purple-200 p-2 rounded-md border border-purple-500 mb-4">
            <h1 class="text-center text-purple-700 font-semibold">QR Akan di perbaharui dalam 1 menit</h1>
        </div>

        <div class="w-64 md:w-96 mx-auto bg-purple-200 p-2 rounded-md border border-purple-500">
            <h1 class="text-sm mb-4 text-purple-700 font-semibold">Cara Penggunaan QR Code</h1>
            <ol class="list-decimal ms-4 text-sm text-slate-600">
                <li>QR hanya memiliki masa aktif 1 menit</li>
                <li>Gunakan QR Scaner yang berada di box</li>
                <li>Arahkan sensor ke layar smartphone</li>
            </ol>
        </div>

        <div class="flex justify-around mt-2">
            <button class="bg-purple-200 p-2 rounded-md" onclick="generateQR('BOX')">Refresh QR</button>
            <button class="bg-purple-200 p-2 rounded-md" onclick="generateQR('LACI')">Buka QR Laci</button>
        </div>
    `;
}

async function generateQR(type) {
    const qrContainer = document.getElementById("qr-container");
    const qrTitle = document.getElementById("qr-title");
    qrContainer.textContent = "";

    if (String(type).toUpperCase() == "BOX") {
        qrTitle.textContent = "box penyimpanan barang";
    }

    if (String(type).toUpperCase() == "LACI") {
        qrTitle.textContent = "laci penyimpanan uang";
    }

    const qrResponse = await httpRequest({
        url: `/api/v1/order/owner/generate-token/${type}`,
        method: "POST",
        body: {
            nomor_resi: storeNomorResi,
        },
    });

    if (!qrResponse.success) {
        alert(`Gagal Membuat QR`);
    }

    if (qrResponse.success) {
        document.getElementById("qr-container").textContent = "";
        let qrcode = new QRCode(
            "qr-container",
            JSON.stringify(qrResponse.data)
        );
    }
}

saveButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const codBoxValue = String(codBoxForm.value).trim();
    const nomorResiValue = String(nomorResiForm.value).trim();
    const nomorPesananValue = String(nomorPesananForm.value).trim();
    const biayaValue = String(biayaForm.value).trim();
    const tipePembayaranValue = String(tipePembayaranForm.value).trim();

    const response = await httpRequest({
        url: "/api/v1/order/owner",
        method: "POST",
        body: {
            nomor_resi: nomorResiValue,
            nomor_pesanan: nomorPesananValue,
            harga_barang: biayaValue,
            tipe_pembayaran: tipePembayaranValue,
            cod_box_id: codBoxValue,
        },
    });

    if (response.success) {
        if (tipePembayaranValue == "ONLINE") {
            alert("Sukses menambahkan pesanan");
        }

        if (tipePembayaranValue == "COD") {
            storeNomorPesanan = nomorPesananValue;
            storeNomorResi = nomorResiValue;
            container.textContent = "";
            container.insertAdjacentHTML("beforeend", showQRForOpenBox());

            setTimeout(async () => {
                // Send REQUEST TO SERVER
                generateQR("BOX");
            }, 50);
        }
    }

    if (!response.success) {
        alert(`Gagal Membuat Pesanan ${response.error}`);
    }
});
