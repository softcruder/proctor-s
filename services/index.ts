const httpService = {
    get: async (path: string) => {
        const response = await fetch(`${path}`);
        const data = await response.json();
        return data;
    },
    post: async (path: string, body: any) => {
        const response = await fetch(`${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return data;
    },
    patch: async (path: string, body: any) => {
        const response = await fetch(`${path}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return data;
    },
    remove: async (path: string) => {
        const response = await fetch(`${path}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    },
    fetcher: async (url: string) => fetch(url).then((res) => res.json()),
};

export default httpService;