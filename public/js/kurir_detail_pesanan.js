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

        <video id="video" width="640" height="480" class="aspect-square mb-4 mx-auto w-64 border rounded-md overflow-hidden" autoplay style="object-fit: cover;"></video>
        <img id="capturedImage" width="640" height="480" src="" class="aspect-square mb-4 mx-auto w-64 border rounded-md overflow-hidden" alt="Captured Image" style="display:none; object-fit: cover;"/>
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

// Function to get the appropriate video input device
async function getBestCamera() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    // Return the first rear camera for mobile or the front camera for laptops
    // You can further refine this logic based on specific device preferences
    return videoDevices.find(device => device.label.toLowerCase().includes('back')) ||
        videoDevices.find(device => device.label.toLowerCase().includes('front')) ||
        videoDevices[0]; // Fallback to the first available camera
}

async function startCamera() {
    try {
        const camera = await getBestCamera();
        if (!camera) {
            throw new Error('No video input device found.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: camera.deviceId }
        });
        video.srcObject = stream;
    } catch (error) {
        console.error("Error accessing the camera: ", error);
    }
}

function dataURLToBlob(dataURL) {
    let byteString = atob(dataURL.split(",")[1]);
    let mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

function isImageEqual(imageData1, imageData2) {
    return imageData1 === imageData2;
}

function handleImageCapture() {
    const canvas = document.getElementById("canvas");
    const capturedImage = document.getElementById("capturedImage");
    const video = document.getElementById("video");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/jpeg");
    const blob = dataURLToBlob(dataURL);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
        const base64data = reader.result;
        capturedImage.src = base64data;
        capturedImage.style.display = "block";
        canvas.style.display = "none";
        video.style.display = "none";
        // Store the captured image data
        storeCapturedImage(base64data);
    }
}

function storeCapturedImage(imageData) {
    // Save or upload the captured image data as needed
    // For example, you can send it to a server or save it locally
    console.log("Captured image data:", imageData);

    // Example of uploading to server
    // fetch('/upload-image', {
    //     method: 'POST',
    //     body: JSON.stringify({ image: imageData }),
    //     headers: { 'Content-Type': 'application/json' }
    // });
}

// Event Listeners
openBox.addEventListener("click", function () {
    container.innerHTML = renderQRTemplate();
    generateQR();
});

openDrawer.addEventListener("click", function () {
    container.innerHTML = renderCameraTemplate();
    startCamera();

    document.getElementById("capture").addEventListener("click", function () {
        handleImageCapture();
    });

    document.getElementById("upload").addEventListener("click", function () {
        if (reTakeImage) {
            startCamera();
        } else {
            alert("No image taken yet.");
        }
    });
});

takeMoneyPicture.addEventListener("click", function () {
    storeCodBoxId = "money";
    container.innerHTML = renderCameraTemplate();
    startCamera();

    document.getElementById("capture").addEventListener("click", function () {
        handleImageCapture();
    });

    document.getElementById("upload").addEventListener("click", function () {
        if (reTakeImage) {
            startCamera();
        } else {
            alert("No image taken yet.");
        }
    });
});

takeGoodPicture.addEventListener("click", function () {
    storeCodBoxId = "goods";
    container.innerHTML = renderCameraTemplate();
    startCamera();

    document.getElementById("capture").addEventListener("click", function () {
        handleImageCapture();
    });

    document.getElementById("upload").addEventListener("click", function () {
        if (reTakeImage) {
            startCamera();
        } else {
            alert("No image taken yet.");
        }
    });
});