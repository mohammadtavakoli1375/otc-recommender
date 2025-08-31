export function EmptyState({
  title = "موردی یافت نشد",
  desc = "هنوز چیزی اضافه نکرده‌اید."
}: { title?: string; desc?: string }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-gray-100 mb-4" />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-text-secondary text-sm">{desc}</p>
    </div>
  );
}