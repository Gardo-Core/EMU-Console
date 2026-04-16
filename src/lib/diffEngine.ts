/**
 * Myers Diff Algorithm (Greedy Version) with Fuzzy Matching
 * Designed for INI comparison to maintain visual alignment and handle shifted offsets.
 */

export enum EditType {
  EQUAL = 'unchanged',
  INSERT = 'added',
  DELETE = 'removed',
  MODIFY = 'modified'
}

export interface Edit {
  type: EditType;
  content: string;
  lineA?: number; // 0-indexed original line number in file A
  lineB?: number; // 0-indexed original line number in file B
}

/**
 * Standard Levenshtein distance for fuzzy matching
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
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[len1][len2];
}

export function getSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  return 1.0 - distance / maxLen;
}

/**
 * Myers Diff Algorithm (O(ND))
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
      if (k === -D || (k !== D && (V[k - 1] ?? -Infinity) < (V[k + 1] ?? -Infinity))) {
        x = V[k + 1] ?? 0;
      } else {
        x = (V[k - 1] ?? 0) + 1;
      }
      let y = x - k;
      while (x < N && y < M && A[x] === B[y]) {
        x++;
        y++;
      }
      V[k] = x;
      if (x >= N && y >= M) {
        return backtrack(trace, A, B, N, M);
      }
    }
  }
  return [];
}

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
    
    while (x > prevX && y > prevY) {
      edits.unshift({ type: EditType.EQUAL, content: A[x - 1], lineA: x - 1, lineB: y - 1 });
      x--;
      y--;
    }
    
    if (D > 0) {
      if (x === prevX) {
        edits.unshift({ type: EditType.INSERT, content: B[y - 1], lineB: y - 1 });
      } else {
        edits.unshift({ type: EditType.DELETE, content: A[x - 1], lineA: x - 1 });
      }
    }
    
    x = prevX;
    y = prevY;
  }
  
  return edits;
}

/**
 * Heuristic fuzzy matching for modified lines
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
          content: next.content, // We take the new content for the visual display
          lineA: current.lineA,
          lineB: next.lineB,
          oldContent: current.content // Keep original for reference if needed
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
 * Generates the Side-by-Side view data structure with padding
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
        mapB.push({ type: 'removed', text: "" }); // Padding
        break;
      case EditType.INSERT:
        mapA.push({ type: 'added', text: "" }); // Padding
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
