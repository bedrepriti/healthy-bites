export default function MenuSkeleton() {
  return (
    <div className="card">
      <div className="skeleton skeleton-img" />

      <div className="card-body">
        <div className="skeleton skeleton-text long" />
        <div className="skeleton skeleton-text short" />

        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <div className="skeleton skeleton-text short" />
          <div className="skeleton skeleton-text short" />
        </div>

        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
}
