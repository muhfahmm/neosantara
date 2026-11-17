import { forwardRef, type TableHTMLAttributes } from "react";
import styles from "./RootTable.module.css";

type RootTableProps = TableHTMLAttributes<HTMLTableElement>;

const RootTable = forwardRef<HTMLTableElement, RootTableProps>(
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

export default RootTable;
