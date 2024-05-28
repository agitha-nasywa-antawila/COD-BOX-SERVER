async function httpRequest({ url, body = null, method = "POST" }) {
    let response;
    if (body) {
        response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
            method,
            body: JSON.stringify(body),
        });
    }

    if (!body) {
        response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
            method,
        });
    }

    const data = await response.json();
    return data;
}

async function generalDataLoader({ url, func }) {
    const data = await httpRequest({ url, method: "GET" });

    if (data.success) {
        func(data.data);
    }

    if (!data.success) {
        console.log(data);
    }
}
