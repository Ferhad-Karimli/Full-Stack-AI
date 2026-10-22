export default function Loading() {
  return (
    <div className="container page" aria-busy="true">
      <div className="skeleton skeleton--title" />
      <div className="grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            <div className="skeleton skeleton--media" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--short" />
          </div>
        ))}
      </div>
    </div>
  );
}
