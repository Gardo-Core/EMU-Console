# 🛰️ EMU Console: La Scheggia dei Configuratori

Benvenuto nel futuro della configurazione terminali. Se sei qui, o sei un genio o ti hanno appena mollato questo progetto tra le mani. In ogni caso, rilassati: abbiamo riprogettato tutto perché vada **velocissimo** e non ti faccia esplodere il PC.

---

## 🚀 Perché EMU Console è meglio della tua vecchia app?

Semplice. Mentre le altre app si piantano appena provi a caricare un file INI più lungo di una lista della spesa, EMU Console usa una tecnologia spaziale:

*   **Multi-Threading (Web Workers):** I calcoli pesanti (diff, validazione, merge) non girano nella UI. Abbiamo dei "minatori" (Workers) che lavorano nel sottosuolo così tu puoi continuare a scrollare a 60 FPS.
*   **Next.js RSC Power:** Carichiamo solo il codice che serve davvero. Niente mattoni JavaScript al primo avvio. L'app carica prima che tu possa dire "AS400".
*   **GPU Accelerated UI:** Effetti CRT e Glassmorphism gestiti direttamente dalla scheda video. È così fluida che sembra burro. 🧈
*   **Editor "Nerd-Proof":** Validazione in tempo reale. Se scrivi una cavolata nell'INI, il sistema ti avvisa prima che tu faccia danni.

---

## 🛠 Tech Stack (Roba Seria)

*   **Framework:** Next.js 14+ (App Router).
*   **Motore di Calcolo:** Web Workers (per non far laggare nulla).
*   **Stile:** Tailwind CSS + Glassmorphism adattivo.
*   **Animazioni:** Framer Motion (versione `m` per bundle leggeri).
*   **Database:** Supabase (con query ottimizzate al millimetro).

---

## 📂 Guida per il Nuovo Sviluppatore (Orientati o Muori)

Se vuoi metterci le mani senza rompere tutto, ecco i posti magici:

1.  `src/app/page.tsx`: Il punto di ingresso. È un Server Component, non sporcarlo con logica client!
2.  `src/components/AppShell.tsx`: Il "Capo". Gestisce lo stato e carica i componenti pesanti solo quando serve.
3.  `src/workers/engine.worker.ts`: Qui c'è la forza bruta. Se devi fare calcoli pesanti, aggiungili qui.
4.  `src/hooks/useWorker.ts`: Il ponte radio per parlare con i minatori (i Workers).
5.  `src/components/TerminalPreview.tsx`: Il pezzo forte. Gestisce il monitor virtuale e l'editor INI.

---

## ⌨️ Comandi Veloci

1.  `npm install`: Scarica tutto il necessario.
2.  `npm run dev`: Lancia l'app in locale e vai su `localhost:3000`.
3.  **Password:** Se vedi il lucchetto, la combinazione segreta è `EMUADMIN`.

---

## 💡 Pro Tips for Maintenance

*   **Evita il "Lag":** Se devi aggiungere una funzione che cicla migliaia di righe, **NON** metterla nel componente. Mettila nel `engine.worker.ts`. La UI deve restare sacra e libera.
*   **Pensa al Mobile:** Molti installatori usano tablet o telefoni. Testa sempre il monitor flottante (TerminalPreview) su schermi piccoli.
*   **Query Pulite:** Quando chiedi dati a Supabase, non usare `.select("*")`. Sii specifico, risparmia banda e la batteria dei dispositivi ti ringrazierà.

---

Buona fortuna, ne avrai bisogno. Se l'app va come una scheggia, è merito del nostro refactoring. Se crasha... beh, controlla i log! 😉

**By Marco Gardelli & Antigravity AI**
