const nomorResiForm = document.getElementById("nomor_resi");
const saveButton = document.getElementById("simpan");
const container = document.getElementById("container");
const openBox = document.getElementById("box-toggle");
const openDrawer = document.getElementById("drawer-toggle");
const takeMoneyPicture = document.getElementById("take-money-picture");
const takeGoodPicture = document.getElementById("take-good-picture");

let storeNomorResi;
let boxType = "BOX"; // Value can be BOX or LACI
let reTakeMoneyImage,
    reTakeGoodImage = false;

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
                <li>Letakan Uang Anda Di Laci Yang Disediakan</li>
                <li>Arahkan Kamera Ke Laci Tempat Uang, Tekan tombol AMBIL FOTO</li>
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

saveButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const nomorResiValue = String(nomorResiForm.value).trim();

    const response = await httpRequest({
        url: "/api/v1/kurir/take/order",
        method: "POST",
        body: {
            nomor_resi: nomorResiValue,
        },
    });

    if (response.success) {
        storeNomorResi = nomorResiValue;
        updateQueryParam("resi", storeNomorResi);
        container.textContent = "";
        container.insertAdjacentHTML("beforeend", renderQRTemplate());
        document.getElementById("terima-pesanan").classList.add("hidden");

        if (response.data.tipe_pembayaran === "ONLINE") {
            openDrawer.classList.add("hidden");
            takeMoneyPicture.classList.add("hidden");
        }

        setTimeout(async () => {
            // Send REQUEST TO SERVER
            generateQR();
        }, 50);
    }

    if (!response.success) {
        alert(response?.errors || "Gagal mengambil pesanan");
    }
});

openBox.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!storeNomorResi) {
        alert("Buat Pesanana Terlebih Dahulu");
        return;
    }

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

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
        });
        video.srcObject = stream;
    } catch (error) {
        console.error("Error accessing the camera: ", error);
    }
}

// Convert dataURL to Blob
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

takeMoneyPicture.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!storeNomorResi) {
        alert("Buat Pesanana Terlebih Dahulu");
        return;
    }

    container.textContent = "";
    container.insertAdjacentHTML("beforeend", renderCameraTemplate());

    setTimeout(async () => {
        let video = document.getElementById("video");
        let canvas = document.getElementById("canvas");
        let capturedImage = document.getElementById("capturedImage");
        let captureButton = document.getElementById("capture");
        let uploadButton = document.getElementById("upload");

        await startCamera();

        // Capture the photo
        captureButton.addEventListener("click", function () {
            let context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            let dataUrl = canvas.toDataURL("image/png");
            capturedImage.src = dataUrl;
            if (reTakeMoneyImage == false) {
                capturedImage.style.display = "block";
                video.style.display = "none";
                captureButton.textContent = "Ambil Ulang";
                reTakeMoneyImage = true;
            } else {
                capturedImage.style.display = "none";
                video.style.display = "block";
                captureButton.textContent = "Ambil Foto";
                reTakeMoneyImage = false;
            }
        });

        uploadButton.addEventListener("click", async () => {
            let dataUrl = canvas.toDataURL("image/png");
            let blob = dataURLToBlob(dataUrl);
            let formData = new FormData();
            formData.append("file", blob, "photo.png");

            try {
                let response = await fetch(
                    `/api/v1/kurir/take-money-picture/${storeNomorResi}`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (response.ok) {
                    alert("Upload successful");
                } else {
                    alert("Upload failed");
                }
            } catch (error) {
                alert("Error uploading the file:", error);
            }
        });
    }, 50);
});

takeGoodPicture.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!storeNomorResi) {
        alert("Buat Pesanana Terlebih Dahulu");
        return;
    }

    container.textContent = "";
    container.insertAdjacentHTML("beforeend", renderCameraTemplate());

    setTimeout(async () => {
        let video = document.getElementById("video");
        let canvas = document.getElementById("canvas");
        let capturedImage = document.getElementById("capturedImage");
        let captureButton = document.getElementById("capture");
        let uploadButton = document.getElementById("upload");

        await startCamera();

        // Capture the photo
        captureButton.addEventListener("click", function () {
            let context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            let dataUrl = canvas.toDataURL("image/png");
            capturedImage.src = dataUrl;
            if (reTakeGoodImage == false) {
                capturedImage.style.display = "block";
                video.style.display = "none";
                captureButton.textContent = "Ambil Ulang";
                reTakeGoodImage = true;
            } else {
                capturedImage.style.display = "none";
                video.style.display = "block";
                captureButton.textContent = "Ambil Foto";
                reTakeGoodImage = false;
            }
        });

        uploadButton.addEventListener("click", async () => {
            let dataUrl = canvas.toDataURL("image/png");
            let blob = dataURLToBlob(dataUrl);
            let formData = new FormData();
            formData.append("file", blob, "photo.png");

            try {
                let response = await fetch(
                    `/api/v1/kurir/take-good-picture/${storeNomorResi}`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (response.ok) {
                    alert("Upload successful, order complate");
                    window.location = "/kurir/pesanan/list";
                } else {
                    alert("Upload failed");
                }
            } catch (error) {
                alert("Error uploading the file:", error);
            }
        });
    }, 50);
});
