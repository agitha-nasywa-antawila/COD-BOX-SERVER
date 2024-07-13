const timelineContainer = document.getElementById("timeline-container");
const resiContainer = document.getElementById("nomor-resi");
const ownerContainer = document.getElementById("order-owner");
const orderCreationContainer = document.getElementById("order-creation");
const orderFinishContainer = document.getElementById("order-finish");
const kurirContainer = document.getElementById("kurir");

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const params = new URLSearchParams(url.search);
const urlTipePembayaran = params.get("payment");
const urlResi = params.get("resi");

const renderImage = async (imageName) => {
    return `
        <img class="aspect-video w-64 border-2 border-gray-100 shadow-sm bg-slate-300 rounded-md overflow-hidden mt-2" src="/public/img/${imageName}" alt="">
    `;
};

const timelineTemplate = async (data) => {
    return `
    <li class="mb-10 ms-6" id="timeline-${data.id}">
        <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
            <svg class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
            </svg>
        </span>
        <h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">${
            data.kategori.name
        }</h3>
        <time class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">${days(
            data.createdAt
        )} oleh ${data.user.username}</time>

        ${data.value ? await renderImage(data.value) : ""}
        
    </li>
    `;
};

// <p class="text-base font-normal text-gray-500 dark:text-gray-400">Pengguna menaruh uang dengan nominal Rp 8.000,00 pada box penyimpanan uang</p>

const renderTimeline = async (data) => {
    resiContainer.textContent = data.header.resi;
    ownerContainer.textContent = data.header.owner;
    orderCreationContainer.textContent = days(data.header.createdAt);
    orderFinishContainer.textContent = days(data.header.finishAt);
    kurirContainer.textContent = data.header.kurir;

    for (let i = 0; i < data.timeline.length; i++) {
        const timelineData = data.timeline[i];
        timelineContainer.insertAdjacentHTML(
            "beforeend",
            await timelineTemplate(timelineData)
        );
    }
};

generalDataLoader({
    url: `/api/v1/order/timeline/${urlResi}`,
    func: renderTimeline,
});
