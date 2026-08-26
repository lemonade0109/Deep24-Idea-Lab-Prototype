import { BrandRowProps } from "@/types";

export function BrandRow({ compact = false }: BrandRowProps) {
  return (
    <div className={`brand-row${compact ? " compact-brand" : ""}`}>
      <span className="brand-mark" aria-hidden="true">
        D24
      </span>
      <span className="brand-name">Deep24 Idea Lab</span>
      <span className="exploration-badge">Product exploration</span>
    </div>
  );
}
