"use client";
import { diffLines, Change } from 'diff';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * Visualizzatore delle differenze (Diff).
 * Prende il testo vecchio e quello nuovo e genera una tabella 
 * che evidenzia cosa è stato aggiunto (+) in verde e cosa rimosso (-) in rosso.
 * Viene usato nell'anteprima prima del salvataggio.
 */
export function DiffViewer({ oldText, newText }: { oldText: string, newText: string }) {
  // Calcoliamo le differenze riga per riga. 
  // Usiamo useMemo per non rifare il calcolo se il testo non è cambiato.
  const differences = useMemo(() => diffLines(oldText, newText), [oldText, newText]);

  return (
    <div className="font-mono text-sm border border-emu-border rounded-md overflow-x-auto bg-[#030d12]">
      <table className="w-full text-left border-collapse">
        <tbody>
          {differences.map((part: Change, index: number) => {
            const isAdded = part.added;
            const isRemoved = part.removed;
            const lines = part.value.split('\n');
            
            // Pulizia: split('\n') a volte lascia una riga vuota finale che non vogliamo visualizzare
            if (lines[lines.length - 1] === '') lines.pop(); 
            
            return lines.map((line, lineIndex) => (
              <tr 
                key={`${index}-${lineIndex}`}
                className={cn(
                  "hover:bg-emu-surface/50",
                  // Verde per aggiunte, Rosso sbarrato per rimozioni
                  isAdded && "bg-green-500/10 text-green-400",
                  isRemoved && "bg-red-500/10 text-red-400 line-through opacity-80",
                  !isAdded && !isRemoved && "text-white/70"
                )}
              >
                {/* Colonna dei segni +/- */}
                <td className="px-2 py-0.5 w-6 text-right select-none opacity-50 border-r border-emu-border/30">
                  {isAdded ? '+' : isRemoved ? '-' : ' '}
                </td>
                {/* Il contenuto della riga di codice/testo */}
                <td className="px-4 py-0.5 whitespace-pre">
                  {line}
                </td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}
