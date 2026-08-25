export function BrandRow({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-row${compact ? " compact-brand" : ""}`}>
      <span className="brand-mark" aria-hidden="true">
        D24
      </span>
      <span className="brand-name">Deep24 Idea Lab</span>
      {!compact ? (
        <span className="exploration-badge">Product exploration</span>
      ) : null}
    </div>
  );
}
