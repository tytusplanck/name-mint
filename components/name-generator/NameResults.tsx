interface NameResultsProps {
  names: string[];
}

export function NameResults({ names }: NameResultsProps) {
  if (names.length === 0) return null;

  return (
    <div className="pt-8 border-t space-y-4">
      <h2 className="text-xl font-semibold text-[#333333]">Generated Names</h2>
      <div className="grid gap-3">
        {names.map((name, index) => (
          <div
            key={index}
            className="p-4 bg-gradient-to-r from-purple-50 to-red-50 rounded-lg border border-purple-100/50 hover:border-purple-200/50 transition-colors"
          >
            <p className="text-gray-800 font-medium">{name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
