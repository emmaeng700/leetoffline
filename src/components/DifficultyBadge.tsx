export default function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    Easy:   'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard:   'bg-red-100 text-red-700',
  }
  const cls = styles[difficulty] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {difficulty}
    </span>
  )
}
