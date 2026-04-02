// All state stored in localStorage — no network needed

export function getVisited(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem('lo_visited') || '[]'))
  } catch { return new Set() }
}

export function addVisited(id: number): void {
  if (typeof window === 'undefined') return
  const s = getVisited()
  s.add(id)
  localStorage.setItem('lo_visited', JSON.stringify([...s]))
}

export interface Progress {
  solved: boolean
  starred: boolean
}

export function getProgress(): Record<string, Progress> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem('lo_progress') || '{}')
  } catch { return {} }
}

export function updateProgress(id: number, data: Partial<Progress>): void {
  if (typeof window === 'undefined') return
  const p = getProgress()
  const existing = p[String(id)] ?? { solved: false, starred: false }
  p[String(id)] = { ...existing, ...data }
  localStorage.setItem('lo_progress', JSON.stringify(p))
}
