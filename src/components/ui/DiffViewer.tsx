import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useEffect, useState, useMemo } from 'react';
import { runDiffWorker, Edit } from '@/lib/diffEngine';
import { cn } from '@/lib/utils';

export function DiffViewer({ oldText, newText }: { oldText: string, newText: string }) {
  const [flatLines, setFlatLines] = useState<Edit[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateDiff = async () => {
      // Calcolo differenziale delegato al Web Worker per prevenire il blocco del thread principale.
      const linesA = oldText.split('\n');
      const linesB = newText.split('\n');
      const results = await runDiffWorker(linesA, linesB);
      setFlatLines(results);
    };
    calculateDiff();
  }, [oldText, newText]);

  const rowVirtualizer = useVirtualizer({
    count: flatLines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    overscan: 10,
  });

  return (
    <div 
      ref={parentRef}
      className="font-mono text-sm border border-emu-border rounded-md overflow-y-auto bg-[#030d12] relative h-[500px] custom-scrollbar"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = flatLines[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={cn(
                "flex items-center hover:bg-emu-surface/50 border-b border-emu-border/5 transition-colors",
                item.type === 'added' && "bg-green-500/10 text-green-400",
                item.type === 'removed' && "bg-red-500/10 text-red-400 line-through opacity-80",
                item.type === 'unchanged' && "text-white/70"
              )}
            >
              {/* Colonna dei segni +/- */}
              <div className="px-2 py-0.5 w-8 shrink-0 text-right select-none opacity-50 border-r border-emu-border/30 mr-4 font-bold">
                {item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ' '}
              </div>
              {/* Il contenuto della riga */}
              <div className="flex-1 px-4 py-0.5 whitespace-pre truncate">
                {item.content || " "}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
