"use client";
import { diffLines, Change } from 'diff';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export function DiffViewer({ oldText, newText }: { oldText: string, newText: string }) {
  const differences = useMemo(() => diffLines(oldText, newText), [oldText, newText]);

  return (
    <div className="font-mono text-sm border border-emu-border rounded-md overflow-x-auto bg-[#030d12]">
      <table className="w-full text-left border-collapse">
        <tbody>
          {differences.map((part: Change, index: number) => {
            const isAdded = part.added;
            const isRemoved = part.removed;
            const lines = part.value.split('\n');
            if (lines[lines.length - 1] === '') lines.pop(); // Remove trailing empty line from split
            
            return lines.map((line, lineIndex) => (
              <tr 
                key={`${index}-${lineIndex}`}
                className={cn(
                  "hover:bg-emu-surface/50",
                  isAdded && "bg-green-500/10 text-green-400",
                  isRemoved && "bg-red-500/10 text-red-400 line-through opacity-80",
                  !isAdded && !isRemoved && "text-white/70"
                )}
              >
                <td className="px-2 py-0.5 w-6 text-right select-none opacity-50 border-r border-emu-border/30">
                  {isAdded ? '+' : isRemoved ? '-' : ' '}
                </td>
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
