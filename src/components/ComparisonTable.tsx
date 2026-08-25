import { motion } from "framer-motion";
import type { ComparisonTable as ComparisonTableType } from "@/data/servicePages";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface Props {
  table: ComparisonTableType;
  index: number;
}

export const ComparisonTable = ({ table, index }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
    >
      <h3 className="heading-industrial text-lg mb-2 flex items-center gap-3">
        <div className="accent-line !w-6" />
        {table.title}
      </h3>
      {table.description && (
        <p className="text-sm text-muted-foreground mb-4">{table.description}</p>
      )}
      <div className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 border-b-2 border-primary/20">
                {table.headers.map((header, i) => (
                  <TableHead
                    key={i}
                    className={`text-xs font-bold uppercase tracking-wider text-foreground whitespace-nowrap ${
                      i === 0 ? "text-left" : "text-right"
                    }`}
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((row, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  className={`
                    ${rowIdx % 2 === 0 ? "bg-card" : "bg-muted/30"}
                    ${table.highlight === rowIdx ? "bg-primary/10 border-l-2 border-l-primary" : ""}
                    hover:bg-primary/5 transition-colors
                  `}
                >
                  {row.map((cell, cellIdx) => (
                    <TableCell
                      key={cellIdx}
                      className={`text-sm py-3 whitespace-nowrap ${
                        cellIdx === 0
                          ? "font-semibold text-left"
                          : "font-mono text-right text-muted-foreground"
                      }`}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  );
};
