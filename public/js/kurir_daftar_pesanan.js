let counter = 1;
const container = document.getElementById("data-container");
const searchForm = document.getElementById("table-search");

const onlinePaymentTemplate = () => {
    return `
        <div class="flex">
            <p class="flex bg-emerald-500 rounded-md text-xs p-2 text-white font-semibold">
                <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clip-rule="evenodd"/>
                    <path fill-rule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clip-rule="evenodd"/>
                </svg>                                      
                Online Payment
            </p>
        </div>
    `;
};

const codPaymentTemplate = () => {
    return `
       <div class="flex">
            <p class="flex bg-orange-500 rounded-md text-xs p-2 text-white font-semibold">
                <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M7 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2v-4a3 3 0 0 0-3-3H7V6Z" clip-rule="evenodd"/>
                    <path fill-rule="evenodd" d="M2 11a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7Zm7.5 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" clip-rule="evenodd"/>
                    <path d="M10.5 14.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
                </svg>                                                                           
                COD
            </p>
        </div>
    `;
};

const orderComplateTemplate = () => {
    return `
        <a href="/kurir/pesanan/timeline?resi=${resi}">
            <svg class="w-5 h-5 cursor-pointer text-emerald-500 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z" clip-rule="evenodd"/>
            </svg>
        </a>
    `;
};

const orderNotComplateTemplate = (resi) => {
    return `
        <a href="/kurir/pesanan/detail?resi=${resi}">
            <svg class="w-5 h-5 cursor-pointer text-gray-600 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M11.403 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6.403a3.01 3.01 0 0 1-1.743-1.612l-3.025 3.025A3 3 0 1 1 9.99 9.768l3.025-3.025A3.01 3.01 0 0 1 11.403 5Z" clip-rule="evenodd"/>
                <path fill-rule="evenodd" d="M13.232 4a1 1 0 0 1 1-1H20a1 1 0 0 1 1 1v5.768a1 1 0 1 1-2 0V6.414l-6.182 6.182a1 1 0 0 1-1.414-1.414L17.586 5h-3.354a1 1 0 0 1-1-1Z" clip-rule="evenodd"/>
            </svg>
        </a>
    `;
};

const tableRowTemplate = (counter, data) => {
    return `
        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <td class="w-4 p-4">
                ${counter}
            </td>
            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                ${data.order_resi}
            </th>
            <td class="px-6 py-4">
                ${data.status_terakhir_deskripsi}
            </td>
            <td class="px-6 py-4">
                ${data.isOrderComplate == true
            ? orderComplateTemplate()
            : orderNotComplateTemplate(data.order_resi)
        }
            </td>
            <td class="px-6 py-4">
                ${data.tipe_pembayaran === "COD"
            ? codPaymentTemplate()
            : onlinePaymentTemplate()
        }
            </td>
        </tr>
    `;
};

const renderTableRow = (data) => {
    for (let i = 0; i < data.length; i++) {
        const orderData = data[i];
        container.insertAdjacentHTML(
            "beforeend",
            tableRowTemplate(counter, orderData)
        );
        counter++;
    }
};

generalDataLoader({ url: "/api/v1/kurir/order/daftar", func: renderTableRow });

searchForm.addEventListener("keyup", (e) => {
    if (String(searchForm.value).length > 3 || e.key == "Enter") {
        const searchValue = String(searchForm.value).trim();
        container.textContent = "";
        counter = 1;

        generalDataLoader({
            url: `/api/v1/kurir/order/daftar?search=${searchValue}`,
            func: renderTableRow,
        });
    }
});
