const container = document.getElementById("container");
const openBox = document.getElementById("box-toggle");
const openDrawer = document.getElementById("drawer-toggle");
const takeMoneyPicture = document.getElementById("take-money-picture");
const takeGoodPicture = document.getElementById("take-good-picture");
const deviceList = [];

let storeNomorResi, storeNomorPesanan, storeCodBoxId;
let boxType = "BOX"; // Value can be BOX or LACI
let reTakeImage = false;

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
            <h1 class="text-center text-purple-700 font-semibold">QR Akan di perbaharui dalam 3 menit</h1>
        </div>

        <div class="w-64 md:w-96 mx-auto bg-purple-200 p-2 rounded-md border border-purple-500">
            <h1 class="text-sm mb-4 text-purple-700 font-semibold">Cara Penggunaan QR Code</h1>
            <ol class="list-decimal ms-4 text-sm text-slate-600">
                <li>QR hanya memiliki masa aktif 3 menit</li>
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

function renderCameraTemplate() {
    return `
        <h1 class="text-xl mb-4 text-center text-purple-700 font-semibold">Ambil Foto</h1>
        <p class="text-center mb-8 w-64 md:w-96 mx-auto text-slate-600">Arahkan Kamera Ke Tempat Anda Meletakan Uang/Barang</p>

        <video id="video" width="640" height="480" class="aspect-square mb-4 mx-auto w-64 border rounded-md overflow-hidden " autoplay style="object-fit: cover;"></video>
        <img id="capturedImage" width="640" height="480" src="" class="aspect-square mb-4 mx-auto w-64 border rounded-md overflow-hidden " alt="Captured Image" style="display:none; object-fit: cover;"/>
        <canvas id="canvas" class="aspect-square mb-4 mx-auto w-64 border rounded-md overflow-hidden" style="display:none;"></canvas>

        <div class="w-64 md:w-96 mx-auto bg-purple-200 p-2 rounded-md border border-purple-500 mb-4">
            <h1 class="text-center text-purple-700 font-semibold">Arahkan Kamera Dengan Benar</h1>
        </div>

        <div class="w-64 md:w-96 mx-auto bg-purple-200 p-2 rounded-md border border-purple-500">
            <h1 class="text-sm mb-4 text-purple-700 font-semibold">Cara Pengambilan Gambar</h1>
            <ol class="list-decimal ms-4 text-sm text-slate-600">
                <li>Letakan Uang atau Barang Anda pada tempat Yang Disediakan</li>
                <li>Arahkan Kamera Ke Tempat Uang/Barang, Tekan tombol AMBIL FOTO</li>
                <li>Upload Gambar</li>
            </ol>
        </div>

        <div class="flex justify-center items-center mt-2">
            <button 
                class="mx-auto px-3 py-2 text-sm font-medium text-center inline-flex items-center text-white bg-purple-700 rounded-lg hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800" 
                id="capture"
            >
                Ambil Foto
            </button>
            <button 
                class="mx-auto px-3 py-2 text-sm font-medium text-center inline-flex items-center text-white bg-purple-700 rounded-lg hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800" 
                id="upload"
            >
                Upload
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
        url: `/api/v1/kurir/generate-token/${boxType}`,
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

// Handle URL Change When Page First Load
const currentUrl = window.location.href;
const url = new URL(currentUrl);
const params = new URLSearchParams(url.search);
const urlTipePembayaran = params.get("payment");
const urlResi = params.get("resi");
storeNomorResi = urlResi;
generalDataLoader({
    url: `/api/v1/order/owner/order/${urlResi}`,
    func: async (data) => {
        storeTipePembayaran = data.tipe_pembayaran;
        if (storeTipePembayaran === "ONLINE") {
            // Hilangkan bagian ambil foto uang dan buka laci, karena pembelian dengan online payment tidak perlu melakukan hal itu
            document.getElementById("drawer-toggle").classList.add("hidden");
            document
                .getElementById("take-money-picture")
                .classList.add("hidden");
        }
    },
});
generateQR();

openBox.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!storeNomorResi) {
        alert("Buat Pesanana Terlebih Dahulu");
        return;
    }

    // Jika container telah di destroy maka buat ulang
    const qrContainer = document.getElementById("qr-container");
    if (!qrContainer) {
        container.textContent = "";
        container.insertAdjacentHTML("beforeend", renderQRTemplate());
    }

    boxType = "BOX";
    generateQR();
});

openDrawer.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!storeNomorResi) {
        alert("Buat Pesanana Terlebih Dahulu");
        return;
    }

    // Jika container telah di destroy maka buat ulang
    const qrContainer = document.getElementById("qr-container");
    if (!qrContainer) {
        container.textContent = "";
        container.insertAdjacentHTML("beforeend", renderQRTemplate());
    }

    boxType = "LACI";
    generateQR();
});

takeMoneyPicture.addEventListener("click", (e) => {
    e.preventDefault();
    if (!storeNomorResi) {
        alert("Buat Pesanana Terlebih Dahulu");
        return;
    }

    // Jika container telah di destroy maka buat ulang
    const cameraContainer = document.getElementById("video");
    if (!cameraContainer) {
        container.textContent = "";
        container.insertAdjacentHTML("beforeend", renderCameraTemplate());
        startCamera();
    }
});

takeGoodPicture.addEventListener("click", (e) => {
    e.preventDefault();
    if (!storeNomorResi) {
        alert("Buat Pesanana Terlebih Dahulu");
        return;
    }

    // Jika container telah di destroy maka buat ulang
    const cameraContainer = document.getElementById("video");
    if (!cameraContainer) {
        container.textContent = "";
        container.insertAdjacentHTML("beforeend", renderCameraTemplate());
        startCamera();
    }
});

document.getElementById("capture").addEventListener("click", () => {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const capturedImage = document.getElementById("capturedImage");
    capturedImage.src = canvas.toDataURL("image/png");
    capturedImage.style.display = "block";
    canvas.style.display = "none";
});

document.getElementById("upload").addEventListener("click", async () => {
    const capturedImage = document.getElementById("capturedImage");
    const imageData = capturedImage.src;

    if (!imageData) {
        alert("Tidak ada gambar yang diambil!");
        return;
    }

    // Send image data to server
    const response = await httpRequest({
        url: `/api/v1/upload`,
        method: "POST",
        body: {
            image: imageData,
            nomor_resi: storeNomorResi,
        },
    });

    if (response.success) {
        alert("Gambar berhasil diunggah!");
    } else {
        alert("Gagal mengunggah gambar!");
    }
});

async function startCamera() {
    try {
        // Get all video input devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        // Check if there are video devices available
        if (videoDevices.length === 0) {
            throw new Error('No video devices found');
        }

        // Select the appropriate video device (front or rear)
        let videoDeviceId;
        if (videoDevices.length === 1) {
            // Only one video device (typically front camera on laptops)
            videoDeviceId = videoDevices[0].deviceId;
        } else {
            // More than one video device (mobile or multi-camera devices)
            // Assuming the first device is the front camera and the second is the rear camera
            videoDeviceId = videoDevices[1].deviceId; // Select rear camera if available
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: videoDeviceId }
        });
        const video = document.getElementById("video");
        video.srcObject = stream;
    } catch (error) {
        console.error("Error accessing the camera: ", error);
    }
}

async function httpRequest({ url, method, body }) {
    const response = await fetch(url, {
        method: method || "GET",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body) || null
    });
    return await response.json();
}

async function generalDataLoader({ url, func }) {
    const response = await fetch(url);
    const data = await response.json();
    func(data);
}
