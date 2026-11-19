import { forwardRef, type TableHTMLAttributes, type HTMLAttributes, type ThHTMLAttributes, type TdHTMLAttributes } from "react";
import styles from "./RootTable.module.css";
import { rootModalTypography } from "./rootModalTypography";

export type RootTableProps = TableHTMLAttributes<HTMLTableElement>;

export const RootTable = forwardRef<HTMLTableElement, RootTableProps>(
  ({ children, className, ...props }, ref) => (
    <table
      {...props}
      ref={ref}
      className={className ? `${styles.table} ${className}` : styles.table}
    >
      {children}
    </table>
  ),
);

RootTable.displayName = "RootTable";

export interface RootTableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const RootTableHeader = forwardRef<HTMLTableSectionElement, RootTableHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <thead
      {...props}
      ref={ref}
      className={`sticky top-0 z-10 bg-root-canvas border-b border-root-accent/20 ${rootModalTypography.label} ${className ?? ""}`}
    >
      {children}
    </thead>
  ),
);

RootTableHeader.displayName = "RootTableHeader";

export interface RootTableHeadCellProps extends ThHTMLAttributes<HTMLTableCellElement> {}

export const RootTableHeadCell = forwardRef<HTMLTableCellElement, RootTableHeadCellProps>(
  ({ children, className, ...props }, ref) => (
    <th
      {...props}
      ref={ref}
      className={`px-3 py-2.5 text-left font-bold uppercase tracking-wider text-root-subtle ${className ?? ""}`}
    >
      {children}
    </th>
  ),
);

RootTableHeadCell.displayName = "RootTableHeadCell";

export interface RootTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  isActive?: boolean;
}

export const RootTableRow = forwardRef<HTMLTableRowElement, RootTableRowProps>(
  ({ children, className, isActive, ...props }, ref) => (
    <tr
      {...props}
      ref={ref}
      className={`border-t border-root-accent/10 transition-colors ${
        isActive
          ? "bg-root-accent/15 border-l-4 border-l-root-accent text-root-accent"
          : "hover:bg-root-accent/5 odd:bg-root-surface even:bg-root-canvas/50 text-root-text"
      } ${className ?? ""}`}
    >
      {children}
    </tr>
  ),
);

RootTableRow.displayName = "RootTableRow";

export interface RootTableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  isNumeric?: boolean;
}

export const RootTableCell = forwardRef<HTMLTableCellElement, RootTableCellProps>(
  ({ children, className, isNumeric, ...props }, ref) => (
    <td
      {...props}
      ref={ref}
      className={`px-3 py-2 text-xs ${isNumeric ? "text-right font-mono tabular-nums game-stat-number" : "text-left"} ${className ?? ""}`}
    >
      {children}
    </td>
  ),
);

RootTableCell.displayName = "RootTableCell";

export default RootTable;
