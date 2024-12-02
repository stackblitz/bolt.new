export function parseCookies(cookieHeader: string) {
    const cookies: any = {};

    // Split the cookie string by semicolons and spaces
    const items = cookieHeader.split(';').map((cookie) => cookie.trim());

    items.forEach((item) => {
        const [name, ...rest] = item.split('=');

        if (name && rest) {
            // Decode the name and value, and join value parts in case it contains '='
            const decodedName = decodeURIComponent(name.trim());
            const decodedValue = decodeURIComponent(rest.join('=').trim());
            cookies[decodedName] = decodedValue;
        }
    });

    return cookies;
}