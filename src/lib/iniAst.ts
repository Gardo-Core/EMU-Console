/**
 * INI AST ARCHITECTURE 🏗️
 * 
 * Questo modulo implementa un parser AST (Abstract Syntax Tree) personalizzato 
 * per garantire che i file INI legacy (tipo quelli Glink/AS400) vengano trattati
 * con i guanti di velluto. 
 * 
 * A differenza di un semplice split('\n'), questo parser preserva:
 * 1. Commenti (sia su riga che inline)
 * 2. Spaziature e righe vuote originali
 * 3. Strutture speciali come la sezione [file:v_key]
 */

export type NodeType = 'Section' | 'Property' | 'Comment' | 'Whitespace' | 'Raw';

export interface ASTNode {
  type: NodeType;
  content: string;
  raw: string; // La riga originale completa per ricostruzione 1:1
  key?: string;
  value?: string;
  sectionName?: string;
}

export class IniAst {
  nodes: ASTNode[] = [];

  constructor(content: string) {
    this.parse(content);
  }

  private parse(content: string) {
    const lines = content.split(/\r?\n/);
    this.nodes = lines.map(line => {
      const trimmed = line.trim();

      // 1. Commenti
      if (trimmed.startsWith(';') || trimmed.startsWith('#')) {
        return { type: 'Comment', content: trimmed, raw: line };
      }

      // 2. Sezioni
      const sectionMatch = trimmed.match(/^\[(.+)\]$/);
      if (sectionMatch) {
        return { type: 'Section', content: trimmed, sectionName: sectionMatch[1], raw: line };
      }

      // 3. Proprietà (Chiave=Valore)
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
        const key = line.substring(0, eqIdx).trim();
        const value = line.substring(eqIdx + 1).trim();
        return { type: 'Property', key, value, content: trimmed, raw: line };
      }

      // 4. Whitespace / Empty
      if (trimmed === '') {
        return { type: 'Whitespace', content: '', raw: line };
      }

      // 5. Raw (Default per righe strane o dati nudi come la licenza)
      return { type: 'Raw', content: trimmed, raw: line };
    });
  }

  /**
   * Mutazione mirata: cambia solo il valore di una chiave specifica,
   * mantenendo tutto il resto (commenti, spazi) inalterato.
   */
  set(key: string, value: string, section?: string) {
    let currentSection = '';
    let found = false;

    for (let node of this.nodes) {
      if (node.type === 'Section') {
        currentSection = node.sectionName || '';
      }

      if (node.type === 'Property' && node.key === key) {
        if (!section || section === currentSection) {
          node.value = value;
          // Ricostruiamo la riga raw mantenendo l'identazione originale se possibile
          const indent = node.raw.substring(0, node.raw.indexOf(node.key));
          node.raw = `${indent}${key}=${value}`;
          found = true;
          break;
        }
      }
    }

    // Se non esiste, dovremmo tecnicamente aggiungerla alla fine della sezione corretta
    if (!found && section) {
      this.addProperty(section, key, value);
    }
  }

  private addProperty(section: string, key: string, value: string) {
    let sectionIdx = this.nodes.findIndex(n => n.type === 'Section' && n.sectionName === section);
    if (sectionIdx !== -1) {
      // Troviamo la fine della sezione
      let insertIdx = sectionIdx + 1;
      for (let i = sectionIdx + 1; i < this.nodes.length; i++) {
        if (this.nodes[i].type === 'Section') break;
        insertIdx = i + 1;
      }
      this.nodes.splice(insertIdx, 0, {
        type: 'Property',
        key,
        value,
        content: `${key}=${value}`,
        raw: `${key}=${value}`
      });
    }
  }

  /**
   * Ricostruzione totale del file con fedeltà estrema alle linee originali.
   */
  stringify(lineEnding: string = '\n'): string {
    return this.nodes.map(n => n.raw).join(lineEnding);
  }

  get(key: string, section?: string): string | undefined {
    let currentSection = '';
    for (let node of this.nodes) {
      if (node.type === 'Section') currentSection = node.sectionName || '';
      if (node.type === 'Property' && node.key === key) {
        if (!section || section === currentSection) return node.value;
      }
    }
    return undefined;
  }
}
