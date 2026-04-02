'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Shuffle, Star, Home, Copy, Check } from 'lucide-react'
import { getVisited, addVisited, getProgress, updateProgress } from '@/lib/local-db'
import { defaultStudyQuestionOrder } from '@/lib/studyPlanOrder'
import { CODE_HIGHLIGHT_TOKEN_CSS } from '@/lib/codeHighlightTheme'
import DifficultyBadge from '@/components/DifficultyBadge'

interface Question {
  id: number
  title: string
  slug: string
  difficulty: string
  tags: string[]
  python_solution?: string
  explanation?: string
}

function CodePanel({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const [highlighted, setHighlighted] = useState<string[]>([])
  const lines = code.split('\n')

  useEffect(() => {
    import('highlight.js/lib/core').then(async ({ default: hljs }) => {
      const python = (await import('highlight.js/lib/languages/python')).default
      hljs.registerLanguage('python', python)
      const result = hljs.highlight(code, { language: 'python' })
      // Split highlighted HTML by newlines preserving spans
      const raw = result.value
      const lineHtmls: string[] = []
      let depth = 0
      let openTags: string[] = []
      let current = ''
      let i = 0
      while (i < raw.length) {
        if (raw[i] === '<') {
          const end = raw.indexOf('>', i)
          const tag = raw.slice(i, end + 1)
          if (tag.startsWith('</')) {
            openTags.pop()
            depth--
          } else if (!tag.endsWith('/>')) {
            openTags.push(tag)
            depth++
          }
          current += tag
          i = end + 1
        } else if (raw[i] === '\n') {
          const closing = openTags.slice().reverse().map(t => {
            const name = t.match(/<(\w+)/)?.[1] ?? 'span'
            return `</${name}>`
          }).join('')
          const reopening = openTags.join('')
          lineHtmls.push(current + closing)
          current = reopening
          i++
        } else {
          current += raw[i++]
        }
      }
      if (current) lineHtmls.push(current)
      setHighlighted(lineHtmls)
    })
  }, [code])

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayLines = highlighted.length ? highlighted : lines.map(l => l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'))

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-700 bg-[#282c34] flex flex-col">
      <style>{`.fc-hljs .hljs-keyword{color:#c678dd}.fc-hljs .hljs-built_in{color:#e6c07b}.fc-hljs .hljs-string{color:#98c379}.fc-hljs .hljs-number{color:#d19a66}.fc-hljs .hljs-comment{color:#5c6370;font-style:italic}.fc-hljs .hljs-title{color:#61afef}.fc-hljs .hljs-params{color:#abb2bf}.fc-hljs .hljs-operator{color:#56b6c2}.fc-hljs .hljs-punctuation{color:#abb2bf}.fc-hljs .hljs-literal{color:#56b6c2}`}</style>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-gray-700 shrink-0">
        <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-600 text-white">Python</span>
        <button onClick={copyCode} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {/* Code */}
      <div className="overflow-auto p-4 fc-hljs" style={{ maxHeight: 'min(55vh, 480px)' }}>
        <table className="w-full border-collapse">
          <tbody>
            {displayLines.map((html, i) => (
              <tr key={i} className="hover:bg-white/[0.03]">
                <td className="text-[#636d83] select-none text-right pr-4 text-xs font-mono w-8 shrink-0 align-top pt-px">{i + 1}</td>
                <td className="font-mono text-[12px] sm:text-[13px] leading-relaxed text-[#abb2bf] whitespace-pre align-top"
                  dangerouslySetInnerHTML={{ __html: html || ' ' }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function FlashcardsPage() {
  const [all, setAll] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [visited, setVisited] = useState<Set<number>>(new Set())
  const [progress, setProgress] = useState<Record<string, { solved: boolean; starred: boolean }>>({})
  const [isShuffled, setIsShuffled] = useState(false)
  const [filter, setFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard' | 'starred' | 'unsolved'>('all')

  useEffect(() => {
    fetch('/questions_full.json').then(r => r.json()).then((qs: Question[]) => {
      const ordered = defaultStudyQuestionOrder(qs).map(id => qs.find(q => q.id === id)!).filter(Boolean)
      setAll(ordered)
    })
    setVisited(getVisited())
    setProgress(getProgress())
  }, [])

  const deck = useMemo(() => {
    let d = all
    if (filter === 'Easy' || filter === 'Medium' || filter === 'Hard') {
      d = d.filter(q => q.difficulty === filter)
    } else if (filter === 'starred') {
      d = d.filter(q => progress[q.id]?.starred)
    } else if (filter === 'unsolved') {
      d = d.filter(q => !progress[q.id]?.solved)
    }
    if (isShuffled) return [...d].sort(() => Math.random() - 0.5)
    return d
  }, [all, filter, isShuffled, progress])

  const card = deck[idx]

  function next() { setIdx(i => Math.min(i + 1, deck.length - 1)); setFlipped(false) }
  function prev() { setIdx(i => Math.max(i - 1, 0)); setFlipped(false) }

  function flip() {
    setFlipped(f => !f)
    if (card && !visited.has(card.id)) {
      addVisited(card.id)
      setVisited(v => new Set([...v, card.id]))
    }
  }

  function toggleStar() {
    if (!card) return
    const cur = progress[card.id]?.starred ?? false
    updateProgress(card.id, { starred: !cur })
    setProgress(getProgress())
  }

  function toggleSolved() {
    if (!card) return
    const cur = progress[card.id]?.solved ?? false
    updateProgress(card.id, { solved: !cur })
    setProgress(getProgress())
  }

  if (!all.length) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const solved = Object.values(progress).filter(p => p.solved).length
  const starred = Object.values(progress).filter(p => p.starred).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Home size={18} className="text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="font-black text-indigo-600 text-base">Flashcards</h1>
          <p className="text-xs text-gray-400">{solved} solved · {starred} starred · {visited.size} visited</p>
        </div>
        <button onClick={() => { setIsShuffled(s => !s); setIdx(0); setFlipped(false) }}
          className={`p-2 rounded-lg transition-colors ${isShuffled ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}>
          <Shuffle size={16} />
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
        {(['all', 'Easy', 'Medium', 'Hard', 'starred', 'unsolved'] as const).map(f => (
          <button key={f} onClick={() => { setFilter(f); setIdx(0); setFlipped(false) }}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="px-4 mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{idx + 1} / {deck.length}</span>
          <span>{Math.round(((idx + 1) / deck.length) * 100)}%</span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full">
          <div className="h-1 bg-indigo-600 rounded-full transition-all" style={{ width: `${((idx + 1) / deck.length) * 100}%` }} />
        </div>
      </div>

      {/* Card */}
      {card && (
        <div className="px-4 pb-4">
          <div onClick={flip} className="cursor-pointer">
            {!flipped ? (
              /* Front */
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[60vh] flex flex-col">
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs text-gray-400 font-mono">#{card.id}</span>
                      <h2 className="text-xl font-bold text-gray-900 mt-1">{card.title}</h2>
                    </div>
                    <DifficultyBadge difficulty={card.difficulty} />
                  </div>
                  <div className="flex-1 flex items-center justify-center py-2">
                    <img
                      src={`/question-images/${card.id}.jpg`}
                      alt={card.title}
                      className="w-full object-contain rounded-xl"
                      style={{ maxHeight: 'min(60vh, 520px)' }}
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-4">Tap to reveal solution</p>
                </div>
              </div>
            ) : (
              /* Back */
              <div className="bg-[#1e2127] rounded-2xl overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-gray-200 font-bold text-sm">{card.title}</span>
                    <DifficultyBadge difficulty={card.difficulty} />
                  </div>
                  <span className="text-xs text-gray-500 italic">Tap to flip back</span>
                </div>
                <div className="p-4">
                  {card.python_solution
                    ? <CodePanel code={card.python_solution} />
                    : <p className="text-gray-500 text-sm text-center py-8">No solution available</p>
                  }
                </div>
                {card.explanation && (
                  <div className="px-5 pb-4 text-xs text-gray-400 leading-relaxed border-t border-gray-700 pt-3">
                    {card.explanation}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mt-3">
            <button onClick={prev} disabled={idx === 0}
              className="flex-1 flex items-center justify-center gap-1 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronLeft size={16} /> Prev
            </button>
            <button onClick={toggleStar}
              className={`p-3 rounded-xl border transition-colors ${progress[card.id]?.starred ? 'bg-yellow-50 border-yellow-200 text-yellow-500' : 'bg-white border-gray-200 text-gray-400 hover:border-yellow-300'}`}>
              <Star size={16} fill={progress[card.id]?.starred ? 'currentColor' : 'none'} />
            </button>
            <button onClick={toggleSolved}
              className={`px-4 py-3 rounded-xl border text-xs font-bold transition-colors ${progress[card.id]?.solved ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-400 hover:border-green-300'}`}>
              {progress[card.id]?.solved ? '✓ Solved' : 'Mark Solved'}
            </button>
            <button onClick={next} disabled={idx === deck.length - 1}
              className="flex-1 flex items-center justify-center gap-1 py-3 bg-indigo-600 rounded-xl text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
