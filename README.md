# EMU Console

Benvenuti nella **EMU Console**

---

## Cosa fa EMU Console?

La console permette di gestire a 360° il file `config.ini` dei terminali, offrendo:

*   **Configurazione Visiva:** Modifica i parametri (IP, Port, SSL, Aspetto) tramite una UI moderna invece di editare file di testo grezzi.
*   **Anteprima Real-Time:** Un monitor virtuale mostra istantaneamente come apparirà il terminale (colori, font, stringhe di stato) in base alle tue scelte.
*   **Editor INI Intelligente:** Visualizza il codice generato dietro le quinte con evidenziazione sintattica e validazione degli errori in tempo reale.
*   **Integrazione Barcode & Hardware:** Pannelli dedicati per configurare lettori laser e macro per i tasti fisici dei dispositivi.
*   **Auto-Login Scripting:** Generatore integrato di script GLINK per automatizzare l'accesso (User, Password, Libreria) in totale sicurezza.
*   **INI Comparer:** Carica due file diversi per vedere cosa è cambiato riga per riga.

---

## 🛠 Tech Stack


*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Linguaggio:** TypeScript (Tipizzazione forte per evitare bug sui parametri INI)
*   **Stato & Form:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) per la validazione degli schemi.
*   **Animazioni:** [Framer Motion](https://www.framer.com/motion/) (per quel feeling premium e le transizioni fluide).
*   **ICONS:** [Lucide React](https://lucide.dev/).
*   **Styling:** Tailwind CSS (Custom Theme "EMU" con toni petrolio e arancione).

---

## 📂 Struttura del Progetto

Qui trovi le cose importanti:

*   `src/components/tabs/`: Qui ci sono le singole schede di configurazione (Rete, Sicurezza, Aspetto, ecc.).
*   `src/lib/iniValidator.ts`: Il "motore" che controlla se il file INI è scritto bene.
*   `src/lib/template.ts`: La logica che fonde i dati del form con i template INI originali.
*   `src/lib/validationSchemas.ts`: Qui risiedono tutte le regole di business (es. "la porta deve essere numerica", "l'IP deve essere valido").
*   `src/contexts/SearchContext.tsx`: Gestisce la ricerca globale che ti permette di saltare da una tab all'altra cercando un parametro.
*   `public/templates/`: Contiene i file INI base per i vari modelli di palmari supportati.

---

## ⌨️ Comandi Rapidi

Se sei il nuovo sviluppatore assegnato a questo progetto:

1.  **Installa tutto:** `npm install`
2.  **Avvia in locale:** `npm run dev`
3.  **Password di Accesso:** L'app è protetta da un Login Gate. La password predefinita è `EMUADMIN`.

---

## 💡 Note per il Futuro (Manutenzione)

*   **Aggiungere un parametro:** Se devi aggiungere un nuovo campo all'INI, ricordati di inserirlo in `validationSchemas.ts` (per lo stato) e aggiornare il componente `mergeTemplate` in `template.ts` per scrivere effettivamente il valore nel file finale.
*   **Ricerca Globale:** Se aggiungi una nuova tab, assicurati di registrare i suoi campi nel `FIELD_REGISTRY` dentro `SearchContext` se vuoi che siano trovabili tramite la barra di ricerca in alto.
*   **Mobile First:** Ogni modifica alla UI deve essere testata su mobile. Il configuratore usa molto il monitor flottante (TerminalPreview) che deve restare usabile anche su schermi piccoli.

---

Realizzato per rendere il lavoro degli installatori un po' meno noioso. 
**By Marco Gardelli**
