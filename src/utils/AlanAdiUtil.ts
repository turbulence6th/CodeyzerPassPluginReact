export const alanAdiGetir = (url: string) => {
    if (!url) {
        return "__TANIMSIZ PLATFORM__";
    }

    if (url.startsWith("www.")) {
        url = url.substring(4);
    }

    let slashIndis = url.indexOf('/');
    if (slashIndis !== -1) {
        url = url.substring(0, slashIndis);
    }

    return url;
} 