(async () => {

    let doldurAlanlar = [null, null];
    let sonLogin = null;

    // @ts-ignore
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.mesajTipi === "doldur") {
            doldur(request.kullaniciAdi.deger, request.sifre.deger);
            doldurAlanlar = [request.kullaniciAdi.deger, request.sifre.deger];
        } else if (request.mesajTipi === "login") {
            sendResponse(sonLogin);
            // @ts-ignore
            chrome.storage.local.set({login: null}, function() {

            });
        }
    });

    // @ts-ignore
    chrome.storage.local.get(['login'], function(result) {
        if (result.login) {
            beniAciGoster();
            sonLogin = result.login;
        }
    });

    window.addEventListener('beforeunload', () => {
        let kutular = kutuGetir();
        let kullaniciAdiKutusu = kutular[0];
        let sifreKutusu = kutular[1];

        let kullaniciAdi = kullaniciAdiKutusu?.value;
        let sifre = sifreKutusu?.value;

        if (kullaniciAdi && sifre && (kullaniciAdi !== doldurAlanlar[0] || sifre !== doldurAlanlar[1])) {
            // @ts-ignore
            chrome.storage.local.set({
                login: {
                    platform: platformGetir(),
                    kullaniciAdi: kullaniciAdi,
                    sifre: sifre
                }, function() {

                }
            })
        }
    })

    /**
     * 
     * @returns string
     */
    function platformGetir() {
        let pathname = window.location.pathname;
        if (pathname !== "/" && pathname.endsWith("/")) {
            pathname = pathname.substring(0, pathname.length - 1);
        }
        return window.location.hostname + pathname;
    }

    /**
     * 
     * @returns {HTMLInputElement[]}
     */
    function kutuGetir() {
        let sifreKutusu = sifreKutusuGetir();
        let kullaniciAdiKutusu = kullaniciAdiKutusuGetir(sifreKutusu);
        return [kullaniciAdiKutusu, sifreKutusu];
    }

    /**
     * 
     * @param {string} kullaniciAdi 
     * @param {string} sifre 
     */
    function doldur(kullaniciAdi, sifre) {
        let kutular = kutuGetir();
        let kullaniciAdiKutusu = kutular[0];
        if (kullaniciAdiKutusu) {
            kutuDoldur(kullaniciAdiKutusu, kullaniciAdi);
        }

        let sifreKutusu = kutular[1];
        if (sifreKutusu) {
            kutuDoldur(sifreKutusu, sifre);
        }
    }

    /**
     * 
     * @param {HTMLInputElement} input 
     * @param {string} icerik 
     */
    function kutuDoldur(input, icerik) {
        let event = new Event("input", {
            bubbles: true,
            cancelable: true
        })
        input.value = icerik;
        input.dispatchEvent(event);
    }

    function beniAciGoster() {
        let div = document.createElement('div');
        div.classList.add('codeyzer-beniac');

        let shadow = div.attachShadow({mode: 'open'});
        let sifreEklePanel = new SifreEklePanel();
        shadow.append(sifreEklePanel);

        document.body.append(div);

        $(div).draggable();

        sifreEklePanel.$codeyzerKapat.addEventListener('click', () => {
            div.remove();
            // @ts-ignore
            chrome.storage.local.set({login: null}, function() {

            });
        });
    }

    /**
     * 
     * @returns {HTMLInputElement}
     */
    function sifreKutusuGetir() {
        return document.querySelector('input[type="password"]');
    }
  
    /**
     * 
     * @param {HTMLInputElement} sifreKutusu 
     * @returns {HTMLInputElement}
     */
    function kullaniciAdiKutusuGetir(sifreKutusu) {
        /** @type {HTMLInputElement} */ let kullaniciAdiKutusu;
        /** @type {HTMLElement} */ let temp = sifreKutusu;

        while (temp) {
            kullaniciAdiKutusu = /** @type {HTMLInputElement} */ (gorunurElementGetir(temp.querySelectorAll('input[type="text"], input[type="email"]')));
            if (kullaniciAdiKutusu) {
                break;
            }

            temp = temp.parentElement;
        }

        if (!kullaniciAdiKutusu) {
            kullaniciAdiKutusu = /** @type {HTMLInputElement} */ (gorunurElementGetir(document.querySelectorAll('input[type="email"]')));
        }

        return kullaniciAdiKutusu;
    }

    /**
     * 
     * @param {NodeListOf<HTMLElement>} elements 
     * @returns {Element}
     */
    function gorunurElementGetir(elements) {
        for (let element of elements) {
            if (element.offsetHeight !== 0 && element.offsetWidth !== 0) {
                return element;
            }
        }
    }
})();