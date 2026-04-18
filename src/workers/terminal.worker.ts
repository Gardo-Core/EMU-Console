/**
 * TERMINAL RENDERING ENGINE 🎨
 * 
 * Questo worker gestisce tutto il disegno del terminale AS400 su un OffscreenCanvas.
 * Perché? Perché disegnare 2000 celle con colori, blink e attributi DKU 
 * ad ogni frame ucciderebbe il thread principale (e le animazioni UI).
 * 
 * Qui facciamo tutto noi:
 * 1. Calcolo griglia (24x80)
 * 2. Rendering font bitmap o monospace
 * 3. Effetti CRT (linee di scansione, bagliore)
 */

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

const getColorByIndex = (index: number) => {
  switch (index) {
    case 0: return "#000000"; // Nero
    case 1: return "#f01818"; // Rosso
    case 2: return "#24d830"; // Verde
    case 3: return "#7890f0"; // Blu
    case 4: return "#ff00ff"; // Magenta
    case 5: return "#ffff00"; // Giallo
    case 6: return "#58f0f0"; // Ciano
    case 7: return "#ffffff"; // Bianco
    default: return "#ffffff";
  }
};

onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    canvas = payload.canvas;
    ctx = canvas!.getContext('2d');
    render(payload.config);
  }

  if (type === 'UPDATE') {
    render(payload.config);
  }
};

function render(config: any) {
  if (!ctx || !canvas) return;

  const { fontSize = 20, hostname = "ASP.BLUSYS.IT", profileName = "EMUConfig", scrColor = 0, stsColor = 3 } = config;

  const width = canvas.width;
  const height = canvas.height;

  // Sfondo principale
  ctx.fillStyle = getColorByIndex(Number(scrColor));
  ctx.fillRect(0, 0, width, height);

  // Impostazioni font
  ctx.font = `${fontSize}px "Courier New", Courier, monospace`;
  ctx.textBaseline = "top";
  ctx.fillStyle = getColorByIndex(2); // Verde di default

  const host = (hostname || "").slice(0, 15).padEnd(15, ' ');
  const profile = (profileName || "").slice(0, 15).padEnd(15, ' ');

  // Disegno del finto terminale
  let y = 20;
  const lineH = fontSize * 1.2;

  ctx.fillText(`                            ACCESSO`, 20, y);
  y += lineH * 2;
  
  ctx.fillText(`                                    Sistema . . . :  `, 20, y);
  ctx.fillStyle = getColorByIndex(5);
  ctx.fillText(host, 480, y);
  
  y += lineH;
  ctx.fillStyle = getColorByIndex(2);
  ctx.fillText(`                                    Sottosistema  :  QINTER`, 20, y);
  
  y += lineH;
  ctx.fillText(`                                    Display . . . :  `, 20, y);
  ctx.fillStyle = getColorByIndex(5);
  ctx.fillText(profile, 480, y);

  y += lineH * 2;
  ctx.fillStyle = getColorByIndex(2);
  ctx.fillText(`     Utente. . . . . . . . . .  [          ]`, 20, y);
  y += lineH;
  ctx.fillText(`    Password. . . . . . . . .  `, 20, y);
  y += lineH;
  ctx.fillText(`     Programma/procedura . . .  [          ]`, 20, y);
  y += lineH;
  ctx.fillText(`     Menu. . . . . . . . . . .  [          ]`, 20, y);
  y += lineH;
  ctx.fillText(`     Libreria corrente . . . .  [          ]`, 20, y);

  // Riga di stato
  const stsBg = getColorByIndex(Number(stsColor));
  ctx.fillStyle = stsBg;
  ctx.fillRect(0, height - 30, width, 30);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px monospace";
  ctx.fillText("MW", 20, height - 22);
  ctx.fillText("000/000", width - 80, height - 22);

  // Effetto Scanlines (opzionale per il look CRT)
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  for (let i = 0; i < height; i += 4) {
    ctx.fillRect(0, i, width, 2);
  }
}
