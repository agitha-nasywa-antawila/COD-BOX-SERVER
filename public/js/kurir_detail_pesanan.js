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

    if (String(boxType).toUpperCase() === "BOX") {
        qrTitle.textContent = "BOX PENYIMPANAN BARANG";
    }

    if (String(boxType).toUpperCase() === "LACI") {
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
        return; // Added return to stop execution if QR generation fails
    }

    qrContainer.textContent = ""; // Clear any existing content
    let qrcode = new QRCode(
        "qr-container",
        JSON.stringify(qrResponse.data)
    );
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

function startCamera() {
    navigator.mediaDevices.enumerateDevices().then(devices => {
        devices.forEach(device => {
            if (device.kind === 'videoinput') {
                deviceList.push(device);
            }
        });

        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        // Select the first video input device (front or back camera)
        if (deviceList.length > 0) {
            const constraints = {
                video: {
                    deviceId: { exact: deviceList[0].deviceId }
                }
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    video.srcObject = stream;
                    video.play();
                })
                .catch(error => {
                    console.error('Error accessing camera:', error);
                });
        }
    });
}

function captureImage() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const capturedImage = document.getElementById('capturedImage');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Display the captured image
    capturedImage.src = canvas.toDataURL('image/png');
    capturedImage.style.display = 'block';
    video.style.display = 'none';
    canvas.style.display = 'none';
    reTakeImage = true; // Set to true to indicate an image has been captured
}

function uploadImage() {
    const capturedImage = document.getElementById('capturedImage');

    if (capturedImage.src) {
        // Implement image upload functionality here
        console.log('Image ready for upload:', capturedImage.src);
    } else {
        alert('No image captured.');
    }
}

function handleTakeMoneyPicture() {
    if (reTakeImage) {
        // Reset the camera for retaking the photo
        document.getElementById('capturedImage').style.display = 'none';
        document.getElementById('video').style.display = 'block';
        startCamera(); // Restart the camera
        reTakeImage = false;
    } else {
        captureImage(); // Capture image
    }
}

document.getElementById('take-money-picture').addEventListener('click', handleTakeMoneyPicture);
document.getElementById('upload').addEventListener('click', uploadImage);

// Start the camera when the page loads
window.onload = startCamera;
