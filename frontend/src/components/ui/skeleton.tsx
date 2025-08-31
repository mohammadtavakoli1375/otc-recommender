export function ListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}