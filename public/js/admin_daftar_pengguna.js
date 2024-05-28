const dataContainer = document.getElementById("data-container");
const loadMoreDataButton = document.getElementById("load-more-data");
const searchForm = document.getElementById("table-search");
let counter = 1;

const template = (no, data) => {
    const role = data.role.name;
    let isSuperAdmin, isBase, isKurir;
    switch (role) {
        case "SUPER ADMIN":
            isSuperAdmin = "selected";
            break;
        case "BASE":
            isBase = "selected";
            break;
        case "KURIR":
            isKurir = "selected";
            break;
        default:
            break;
    }

    return `
        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 detail-data" data-id="${data.id}">
            <td class="w-4 p-4">
                ${no}
            </td>
            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                ${data.username}
            </th>
            <td class="px-6 py-4">
                ${data.email}
            </td>
            <td class="px-6 py-4">
                <Select class="rounded-md">
                    <option value="SUPER ADMIN" ${isSuperAdmin}>SUPER ADMIN</option>
                    <option value="BASE" ${isBase}>BASE</option>
                    <option value="KURIR" ${isKurir}>KURIR</option>
                </Select>
            </td>
            <td class="px-6 py-4">
                <div class="flex">
                    <p class="flex cursor-pointer bg-orange-500 rounded-md text-xs p-2 text-white font-semibold">
                        <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clip-rule="evenodd"/>
                        </svg>
                        Delete
                    </p>
                </div>
            </td>
        </tr>
    `;
};

const showData = (data) => {
    for (let i = 0; i < data.length; i++) {
        dataContainer.insertAdjacentHTML(
            "beforeend",
            template(counter++, data[i])
        );
    }
};

generalDataLoader({ url: "/api/v1/user/list?search=&cursor=", func: showData });

loadMoreDataButton.addEventListener("click", (e) => {
    e.preventDefault();
    const lastDataId = lastCursorFinder("detail-data", "data-id");
    const searchValue = String(searchForm.value).trim();

    generalDataLoader({
        url: `/api/v1/user/list?search=${searchValue}&cursor=${lastDataId}`,
        func: showData,
    });
});

searchForm.addEventListener("keyup", (e) => {
    if (String(searchForm.value).length > 3 || e.key == "Enter") {
        const searchValue = String(searchForm.value).trim();
        dataContainer.textContent = "";
        counter = 1;

        generalDataLoader({
            url: `/api/v1/user/list?search=${searchValue}&cursor=`,
            func: showData,
        });
    }
});
