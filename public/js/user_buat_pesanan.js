const codBoxForm = document.getElementById("cod_box");
const nomorResiForm = document.getElementById("nomor_resi");
const nomorPesananForm = document.getElementById("nomor_pesanan");
const biayaForm = document.getElementById("biaya");
const tipePembayaranForm = document.getElementById("tipe_pembayaran");
const saveButton = document.getElementById("simpan");
const container = document.getElementById("container");
const openBox = document.getElementById("box-toggle");
const openDrawer = document.getElementById("drawer-toggle");
const deviceList = [];

let storeNomorResi, storeNomorPesanan, storeCodBoxId;
let boxType = "BOX"; // Value can be BOX or LACI

function updateQueryParam(key, value) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // Set or update the query parameter
    params.set(key, value);

    // Update the URL
    url.search = params.toString();

    // Update the browser's URL bar without reloading the page
    history.pushState({}, "Dashboard", url.toString());
}

function setDefaultOption(value) {
    const selectElement = document.getElementById("tipe_pembayaran");
    const options = selectElement.options;
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === value) {
            options[i].selected = true;
            break;
        }
    }
}

function updateSubMenu(paymentType) {
    const forCod = document.querySelectorAll(".for-cod");

    for (let i = 0; i < forCod.length; i++) {
        const element = forCod[i];
        if (paymentType === "COD") {
            element.classList.add("inline-flex");
            element.classList.remove("hidden");
        }

        if (paymentType === "ONLINE") {
            element.classList.remove("inline-flex");
            element.classList.add("hidden");
        }
    }
}

function handleCod() {
    let updateUrl;
    const tipePembayaran = document
        .getElementById("tipe_pembayaran")
        .value.trim();

    updateUrl = `/user/transaksi/buat?payment=${tipePembayaran}`;
    window.history.pushState({}, "Dashboard", updateUrl);

    updateSubMenu(tipePembayaran);
}

function renderQRTemplate() {
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

        <div class="flex justify-center items-center mt-2">
            <button 
                class="mx-auto px-3 py-2 text-sm font-medium text-center inline-flex items-center text-white bg-purple-700 rounded-lg hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800" 
                onclick="generateQR()"
            >
                Refresh QR
            </button>
        </div>
    `;
}

async function generateQR() {
    const qrContainer = document.getElementById("qr-container");
    const qrTitle = document.getElementById("qr-title");
    qrContainer.textContent = "";

    if (String(boxType).toUpperCase() == "BOX") {
        qrTitle.textContent = "BOX PENYIMPANAN BARANG";
    }

    if (String(boxType).toUpperCase() == "LACI") {
        qrTitle.textContent = "LACI PENYIMPANAN UANG";
    }

    const qrResponse = await httpRequest({
        url: `/api/v1/order/owner/generate-token/${boxType}`,
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
            cod_box_id: storeCodBoxId,
        },
    });

    if (response.success) {
        updateQueryParam("resi", response.data.resi);
        if (tipePembayaranValue == "ONLINE") {
            alert("Sukses menambahkan pesanan");
        }

        if (tipePembayaranValue == "COD") {
            storeNomorPesanan = nomorPesananValue;
            storeNomorResi = nomorResiValue;
            container.textContent = "";
            container.insertAdjacentHTML("beforeend", renderQRTemplate());

            setTimeout(async () => {
                // Send REQUEST TO SERVER
                generateQR();
            }, 50);
        }
    }

    if (!response.success) {
        alert(`Gagal Membuat Pesanan ${response.error}`);
    }
});

openBox.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!storeNomorResi || !storeNomorPesanan) {
        alert("Buat Pesanana Terlebih Dahulu");
        return;
    }

    boxType = "BOX";
    generateQR();
});

openDrawer.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!storeNomorResi || !storeNomorPesanan) {
        alert("Buat Pesanana Terlebih Dahulu");
        return;
    }

    boxType = "LACI";
    generateQR();
});

// Handle URL Change When Page First Load
const currentUrl = window.location.href;
const url = new URL(currentUrl);
const params = new URLSearchParams(url.search);
const urlTipePembayaran = params.get("payment");
updateSubMenu(urlTipePembayaran);
setDefaultOption(urlTipePembayaran);

// Fill Up Auto Complate
function fillUpAutoComplate(data) {
    for (let i = 0; i < data.length; i++) {
        const device = data[i];
        deviceList.push({ label: device.name, value: device.id });
    }

    $(document).ready(function () {
        $("#cod_box").autocomplete({
            source: deviceList,
            select: function (event, ui) {
                event.preventDefault();
                codBoxForm.value = ui.item.label;
                storeCodBoxId = ui.item.value;
            },
        });
    });
}
generalDataLoader({
    url: "/api/v1/device/?item=10000",
    func: fillUpAutoComplate,
});