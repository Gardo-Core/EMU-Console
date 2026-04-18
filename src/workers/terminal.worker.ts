/**
 * TERMINAL RENDERING ENGINE
 * 
 * Questo worker gestisce il rendering grafico del terminale AS400 su OffscreenCanvas.
 * 
 * Ruolo: Emulazione visiva del display DKU/IBM.
 * Implementazione: Rendering basato su coordinate proiettate e font scalato.
 * Rationale: Isola le operazioni grafiche per mantenere la fluidita' dell'interfaccia.
 */

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

const getColorByIndex = (index: number) => {
  switch (index) {
    case 0: return "#000000";
    case 1: return "#f01818";
    case 2: return "#24d830";
    case 3: return "#7890f0";
    case 4: return "#ff00ff";
    case 5: return "#ffff00";
    case 6: return "#58f0f0";
    case 7: return "#ffffff";
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

  // Fattore di scala correttivo: compensa la differenza percepita tra valore nominale e resa grafica
  const scaleMultiplier = 1.35;
  const effectiveFontSize = fontSize * scaleMultiplier;

  const width = canvas.width;
  const height = canvas.height;

  // Sfondo principale
  ctx.fillStyle = getColorByIndex(Number(scrColor));
  ctx.fillRect(0, 0, width, height);

  // Impostazioni font scalate
  ctx.font = `${effectiveFontSize}px "Courier New", Courier, monospace`;
  ctx.textBaseline = "top";
  ctx.fillStyle = getColorByIndex(2);

  const host = (hostname || "").slice(0, 15).padEnd(15, ' ');
  const profile = (profileName || "").slice(0, 15).padEnd(15, ' ');

  // Disegno del terminale emulato
  let y = 40;
  const lineH = effectiveFontSize * 1.15;

  ctx.fillText(`                            ACCESSO`, 20, y);
  y += lineH * 2;
  
  ctx.fillText(`                                    Sistema . . . :  `, 20, y);
  ctx.fillStyle = getColorByIndex(5);
  ctx.fillText(host, 440, y);
  
  y += lineH;
  ctx.fillStyle = getColorByIndex(2);
  ctx.fillText(`                                    Sottosistema  :  QINTER`, 20, y);
  
  y += lineH;
  ctx.fillText(`                                    Display . . . :  `, 20, y);
  ctx.fillStyle = getColorByIndex(5);
  ctx.fillText(profile, 440, y);

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

  // Riga di stato (posizionata dinamicamente in base all'altezza del canvas)
  const stsBg = getColorByIndex(Number(stsColor));
  ctx.fillStyle = stsBg;
  ctx.fillRect(0, height - 40, width, 40);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px monospace";
  ctx.fillText("MW", 20, height - 32);
  ctx.fillText("000/000", width - 100, height - 32);

  // Effetto Scanlines per estetica CRT
  ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
  for (let i = 0; i < height; i += 4) {
    ctx.fillRect(0, i, width, 2);
  }
}
