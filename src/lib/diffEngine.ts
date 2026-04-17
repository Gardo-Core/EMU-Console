/**
 * Algoritmo di Diff di Myers (Versione Greedy) con supporto al Fuzzy Matching.
 * 
 * Questo modulo serve a confrontare due file INI in modo "intelligente". 
 * Invece di una semplice riga per riga, cerchiamo di mantenere l'allineamento visivo
 * anche se vengono aggiunte o rimosse intere sezioni, evitando il fastidioso 
 * "effetto trascinamento" dove tutto il resto del file sembra cambiato solo per un offset.
 */

// Tipi di modifica possibili durante il confronto
export enum EditType {
  EQUAL = 'unchanged', // Riga identica in entrambi i file
  INSERT = 'added',    // Riga aggiunta nel secondo file
  DELETE = 'removed',  // Riga rimossa dal primo file
  MODIFY = 'modified'  // Riga che è cambiata leggermente (scovata dal fuzzy matching)
}

export interface Edit {
  type: EditType;
  content: string;
  lineA?: number; // Indice riga originale nel file A
  lineB?: number; // Indice riga originale nel file B
}

/**
 * Distanza di Levenshtein standard.
 * La usiamo per capire quanto due righe sono simili tra loro.
 * Se sono molto simili, invece di segnarle come "una cancellata e una aggiunta", 
 * le segniamo come "una modificata".
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) matrix[i] = [i];
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Cancellazione
        matrix[i][j - 1] + 1,      // Inserimento
        matrix[i - 1][j - 1] + cost // Sostituzione
      );
    }
  }
  return matrix[len1][len2];
}

// Calcola un coefficiente di somiglianza da 0.0 a 1.0
export function getSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  return 1.0 - distance / maxLen;
}

/**
 * L'anima del confronto: Algoritmo di Myers (O(ND)).
 * Trova il percorso più breve per trasformare la sequenza A nella sequenza B.
 */
export function myersDiff(A: string[], B: string[]): Edit[] {
  const N = A.length;
  const M = B.length;
  const MAX = N + M;
  const V: { [key: number]: number } = { 1: 0 };
  const trace: { [key: number]: number }[] = [];

  for (let D = 0; D <= MAX; D++) {
    trace.push({ ...V });
    for (let k = -D; k <= D; k += 2) {
      let x: number;
      // Decidiamo se muoverci verso il basso o verso destra nella matrice di modifica
      if (k === -D || (k !== D && (V[k - 1] ?? -Infinity) < (V[k + 1] ?? -Infinity))) {
        x = V[k + 1] ?? 0;
      } else {
        x = (V[k - 1] ?? 0) + 1;
      }
      let y = x - k;
      // "Sivoliamo" lungo le diagonali se le righe sono uguali (non costa nulla)
      while (x < N && y < M && A[x] === B[y]) {
        x++;
        y++;
      }
      V[k] = x;
      // Se abbiamo raggiunto la fine di entrambi i file, abbiamo finito
      if (x >= N && y >= M) {
        return backtrack(trace, A, B, N, M);
      }
    }
  }
  return [];
}

/**
 * Ricostruisce il set di modifiche ripercorrendo la traccia lasciata da Myers.
 */
function backtrack(trace: { [key: number]: number }[], A: string[], B: string[], N: number, M: number): Edit[] {
  const edits: Edit[] = [];
  let x = N;
  let y = M;

  for (let D = trace.length - 1; D >= 0; D--) {
    const V = trace[D];
    const k = x - y;
    
    let prevK: number;
    if (k === -D || (k !== D && (V[k - 1] ?? -Infinity) < (V[k + 1] ?? -Infinity))) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }
    
    const prevX = V[prevK];
    const prevY = prevX - prevK;
    
    // Gestiamo le parti uguali (diagonali)
    while (x > prevX && y > prevY) {
      edits.push({ type: EditType.EQUAL, content: A[x - 1], lineA: x - 1, lineB: y - 1 });
      x--;
      y--;
    }
    
    // Identifichiamo se c'è stato un inserimento o una cancellazione
    if (D > 0) {
      if (x === prevX) {
        edits.push({ type: EditType.INSERT, content: B[y - 1], lineB: y - 1 });
      } else {
        edits.push({ type: EditType.DELETE, content: A[x - 1], lineA: x - 1 });
      }
    }
    
    x = prevX;
    y = prevY;
  }
  
  return edits.reverse();
}

/**
 * euristica di post-processing per scovare le righe modificate.
 * Se troviamo una cancellazione seguita da un inserimento e le righe sono molto simili (> 80%),
 * le uniamo in un unico tipo MODIFY. Rende la UI molto più pulita.
 */
export function fuzzyMatch(edits: Edit[]): Edit[] {
  const result: Edit[] = [];
  for (let i = 0; i < edits.length; i++) {
    const current = edits[i];
    const next = edits[i + 1];

    if (current && next && current.type === EditType.DELETE && next.type === EditType.INSERT) {
      const similarity = getSimilarity(current.content, next.content);
      if (similarity > 0.8) {
        result.push({
          type: EditType.MODIFY,
          content: next.content, 
          lineA: current.lineA,
          lineB: next.lineB,
          oldContent: current.content 
        } as any);
        i++;
        continue;
      }
    }
    result.push(current);
  }
  return result;
}

/**
 * Genera la struttura dati per la vista Side-by-Side (affiancata).
 * Aggiunge del "padding" vuoto dove necessario per far sì che le righe 
 * uguali siano sempre sulla stessa linea orizzontale.
 */
export function generateSideBySide(A: string[], B: string[]) {
  const rawEdits = myersDiff(A, B);
  const edits = fuzzyMatch(rawEdits);
  
  const mapA: any[] = [];
  const mapB: any[] = [];
  
  for (const edit of edits) {
    switch (edit.type) {
      case EditType.EQUAL:
        mapA.push({ type: 'unchanged', text: edit.content });
        mapB.push({ type: 'unchanged', text: edit.content });
        break;
      case EditType.DELETE:
        mapA.push({ type: 'removed', text: edit.content });
        mapB.push({ type: 'removed', text: "" }); // Vuoto a destra perché a sinistra abbiamo rimosso
        break;
      case EditType.INSERT:
        mapA.push({ type: 'added', text: "" }); // Vuoto a sinistra perché a destra abbiamo aggiunto
        mapB.push({ type: 'added', text: edit.content });
        break;
      case EditType.MODIFY:
        mapA.push({ type: 'modified', text: (edit as any).oldContent || edit.content });
        mapB.push({ type: 'modified', text: edit.content });
        break;
    }
  }
  
  return { map1: mapA, map2: mapB };
}
