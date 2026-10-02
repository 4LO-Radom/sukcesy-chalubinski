// ustala aktualny rok szkolny
function aktualnyRokSzkolny() {

    const dzis = new Date();

    let rok = dzis.getFullYear();

    if (dzis.getMonth() < 8) { // styczeń-sierpień
        rok--;
    }

    return `${rok}/${rok + 1}`;
}

// wypełnia opcjami i przypisuje wartości polu wyboru przedmiotu
function fillSelectPrzedmioty() {

    const filtrPrzedmiot = document.getElementById("filtrPrzedmiot");
        
    const wagiPrzedmiotow = {
        polski: 49,
        historia: 48,
        wos: 47,
        "edukacja obywatelska": 46,
        filozofia: 45,
        religia: 44,
        wok: 43,
        inne_hum: 42,
        angielski: 39,
        niemiecki: 38,
        hiszpański: 37,
        matematyka: 29,
        informatyka: 28,
        fizyka: 27,
        chemia: 26,
        biologia: 25,
        geografia: 24,
        edb: 19,
        "biznes i zarządzanie": 18,
        "edukacja zdrowotna": 17,
        wf: 16
    };

    const przedmioty =
        [...new Set(
            sukcesy.flatMap(x => x.przedmiot)
        )]
        .sort(
            (a, b) =>
                wagiPrzedmiotow[b] -
                wagiPrzedmiotow[a]
        );
    
    przedmioty.forEach(p => {

        const option =
            document.createElement("option");

        option.value = p;
        option.textContent = p;

        filtrPrzedmiot.appendChild(option);

    });
}

//generuje nazwy poszczególnych rodzajów osiągnięć
function nazwaSekcji(sekcja) {

    switch (sekcja) {

        case "n": return "Sukcesy naukowe";

        case "a": return "Sukcesy artystyczne";

        case "s": return "Sukcesy sportowe";

        case "szkolne": return "Konkursy szkolne";

        default: return sekcja;
    }

}

//aktywuje możliwość interakcji przez użytkownika - obsługuje zdarzenia
function aktywujInterakcje () {
    document.getElementById("btnSzukaj").addEventListener("click", () => {

        const fraza = document.getElementById("txtSzukaj").value.trim().toLowerCase();
        const przedmiot = document.getElementById("filtrPrzedmiot").value;

        renderuj(fraza, przedmiot);

    });

    document.getElementById("btnReset").addEventListener("click", () => {

        document.getElementById("txtSzukaj").value = "";
        document.getElementById("filtrPrzedmiot").value = "";

        renderuj();
    });

    document.getElementById("txtSzukaj").addEventListener("keydown", e => {

        if (e.key === "Enter") {
            document.getElementById("btnSzukaj").click();
        }
    });

    document.getElementById("filtrPrzedmiot").addEventListener("change", () => {

        document.getElementById("btnSzukaj").click();
    });
}

//filtruje wpisy w oparciu o pole wyszukiwania
function wyszukaj (rekordy, fraza) {

    function normalizuj(tekst) {

        return (tekst || "")
            .toLowerCase()
            .trim()
            .replace(/[ąćęłńóśźż]/g, znak => ({
                "ą":"a",
                "ć":"c",
                "ę":"e",
                "ł":"l",
                "ń":"n",
                "ó":"o",
                "ś":"s",
                "ź":"z",
                "ż":"z"
            })[znak]);
    }
    
    if (!fraza) return rekordy;
    fraza = fraza.toLowerCase().trim().replace(/\s+/g, " ");
    return rekordy.filter(x => 
         ((normalizuj(x.konkurs)|| "").toLowerCase().includes(normalizuj(fraza)) || 
         (normalizuj(x.uczen)|| "").toLowerCase().includes(normalizuj(fraza)) || 
         (normalizuj(x.opiekun) || "").toLowerCase().includes(normalizuj(fraza)))
    );
}

//filtruje wpisy w oparciu o przedmiot (szkolny)
function filtrujWgPrzedmiotu(rekordy, przedmiot) {

    if (!przedmiot) return rekordy;
    return rekordy.filter(x => x.przedmiot.includes(przedmiot));
}

//sortuje domyślnie: ranga, przedmiot
function sortuj(rekordy) {

    return rekordy.sort((a, b) => b.waga - a.waga);

}

//modyfikuje wpis w kolumnie wynik
function formatujWynik(wynik, etap) {

    wynik = (wynik || "").trim();
    etap = (etap || "").trim();

    if (!etap || etap === "brak etapów") {
        return wynik;
    }

    if (wynik.endsWith(":")) {
        return `${wynik} ${etap}`;
    }

    return `${wynik} (${etap})`;
}

//grupuje wpisy ze względu na rodzaj konkursu
function pobierzRekordy(rok, sekcja) {

    return sukcesy.filter(x => {

        if (x.rok !== rok) {
            return false;
        }

        if (sekcja === "szkolne") {
            return x.ranga === "szkolna";
        }

        return (
            x.rodzaj === sekcja &&
            x.ranga !== "szkolna"
        );

    });

}

//tworzy poszczególne tabele
function utworzTabele(rekordy, sekcja) {

    
    const tabela = document.createElement("table");

        tabela.innerHTML = `
            <thead>
                <tr>
                    <th>${sekcja === "s" ? "Zawody" : "Konkurs"}</th>
                    <th>Uczeń / drużyna</th>
                    <th>Wynik</th>
                    <th>Opiekun</th>
                </tr>
            </thead>
        `;

        const tbody = document.createElement("tbody");

        let konkurs = "";
        let opiekun = "";

        rekordy.forEach(r => {

            const nowyKonkurs = r.konkurs.trim() !== konkurs.trim()
            const nowyOpiekun = r.opiekun !== opiekun || nowyKonkurs;    

            const tr = document.createElement("tr");

            tr.className = nowyKonkurs ? "nowyKonkurs" : "tenSamKonkurs";
            if (!r.zakonczony) {
                tr.classList.add("wTrakcie");
            }

            tr.innerHTML = `
                <td${nowyKonkurs ? "" : ' class="hideBorderTop"'}>${
                    nowyKonkurs
                        ? r.konkurs +
                        (r.uczestnicy
                                ? ` <small>(${r.uczestnicy} uczestników)</small>`
                                : "")
                        : ""
                }</td>
                <td>${r.uczen}</td>
                <td>${formatujWynik(r.wynik,r.etap)}</td>
                <td class=${nowyOpiekun ? "nowyOpiekun" : "hideBorderTop"}>${nowyOpiekun ? (r.opiekun ?? "") : ""}</td>
            `;

            tbody.appendChild(tr);

            konkurs = r.konkurs;
            opiekun = r.opiekun;
        });

        tabela.appendChild(tbody);

    return tabela;

}

//treść paragrafu uwagi
function pokazKomunikat (blad = false) {

    const uwagi = document.createElement("p");
    uwagi.className = "uwagi";

    const naglowek = (blad) ? "<strong>Wystąpił problem z załadowaniem danych.</strong><br>" : "<strong>Uwagi do zestawienia sukcesów</strong><br>";
    const tresc = (blad) ? 'Prosimy spróbować ponownie później. Jeśli problem będzie się powtarzał, prosimy o kontakt: <a href="mailto:d.rzepka@lo4.radom.pl">d.rzepka@lo4.radom.pl</a>.' : 'W przypadku zauważenia błędów, nieścisłości lub brakujących osiągnięć prosimy o kontakt: <a href="mailto:d.rzepka@lo4.radom.pl">d.rzepka@lo4.radom.pl</a>.';

    uwagi.innerHTML = naglowek + tresc;
    kontener.appendChild(uwagi);
}

//główny kontroler strony - zarządza danymi i generuje treść właściwą strony 
function renderuj(fraza = "", przedmiot = "") {

    const aktywneWyszukiwanie = fraza !== "";
    const aktywnyPrzedmiot = przedmiot !== "";

    const lata = [...new Set(sukcesy.map(x => x.rok))].sort().reverse();

    kontener.innerHTML = "";  

    for (const rok of lata) {

        const rokSzkAkt = rok === aktualnyRokSzkolny();

        const detailsRok = document.createElement("details");
        detailsRok.className = "rok";
        detailsRok.open =
            aktywnyPrzedmiot ||
            aktywneWyszukiwanie ||
            rokSzkAkt;

        const summaryRok = document.createElement("summary");
        summaryRok.textContent = rok;

        detailsRok.appendChild(summaryRok);

        sekcje.forEach(sekcja => {

            let rekordy = pobierzRekordy(rok, sekcja);

            if (aktywneWyszukiwanie) rekordy = wyszukaj(rekordy, fraza);

            if (aktywnyPrzedmiot) rekordy = filtrujWgPrzedmiotu(rekordy, przedmiot);

            rekordy = sortuj(rekordy);

            if (rekordy.length === 0) return;

            const detailsSekcja = document.createElement("details");

            detailsSekcja.open = aktywneWyszukiwanie || rokSzkAkt;

            const summarySekcja = document.createElement("summary");
            summarySekcja.textContent = `${nazwaSekcji(sekcja)} (${rekordy.length})`;

            detailsSekcja.appendChild(summarySekcja);

            const tabela = utworzTabele(rekordy, sekcja);

            detailsSekcja.appendChild(tabela);
            detailsRok.appendChild(detailsSekcja);

        });

        kontener.appendChild(detailsRok);

    }

    
    pokazKomunikat();

}

let sukcesy = [];

const sekcje = ["n", "a", "s", "szkolne"];
const kontener = document.getElementById("sukcesy");

fetch(
    "./lista_sukcesow.json", //"https://4LO-Radom.github.io/sukcesy-chalubinski/lista_sukcesow.json",
    { cache: "no-store" }
)
.then(response => {

    if (!response.ok) {

        throw new Error(
            `HTTP ${response.status}`
        );

    }

    return response.json();

})
.then(dane => {

    sukcesy = dane;

    fillSelectPrzedmioty();
    aktywujInterakcje();
    renderuj();

})
.catch(error => {

    console.error(
        "Błąd pobierania danych:",
        error
    );

    kontener.innerHTML = "";

    pokazKomunikat(true);

});
