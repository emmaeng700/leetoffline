'use client'
import Link from 'next/link'
import { Layers, Gamepad2, Download, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)

  async function downloadOffline() {
    setStatus('downloading')
    setProgress(0)
    try {
      const res = await fetch('/questions_full.json')
      const questions: Array<{ id: number }> = await res.json()
      const cache = await caches.open('lo-v1')

      let done = 0
      for (const q of questions) {
        const url = `/question-images/${q.id}.png`
        try {
          const cached = await cache.match(url)
          if (!cached) {
            const r = await fetch(url)
            if (r.ok) await cache.put(url, r)
          }
        } catch { /* skip missing */ }
        done++
        setProgress(Math.round((done / questions.length) * 100))
      }
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-indigo-600 mb-2">LeetOffline</h1>
        <p className="text-gray-500 text-sm">Works fully offline. No login needed.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <Link href="/flashcards" className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <Layers size={28} className="text-indigo-600" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900">Flashcards</p>
            <p className="text-xs text-gray-500 mt-1">Review solutions card by card</p>
          </div>
        </Link>
        <Link href="/game" className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
            <Gamepad2 size={28} className="text-purple-600" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900">Line Game</p>
            <p className="text-xs text-gray-500 mt-1">Fill in the missing code lines</p>
          </div>
        </Link>
      </div>

      <div className="mt-8 w-full max-w-md">
        {status === 'done' ? (
          <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-semibold">
            <CheckCircle size={18} />
            All images cached — fully offline ready!
          </div>
        ) : (
          <button
            onClick={downloadOffline}
            disabled={status === 'downloading'}
            className="w-full flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2 font-semibold text-gray-700">
              <Download size={18} className="text-indigo-500" />
              {status === 'downloading' ? `Caching images… ${progress}%` : 'Download for Offline'}
            </div>
            {status === 'downloading' && (
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            {status === 'error' && (
              <p className="text-xs text-red-500">Something went wrong. Try again.</p>
            )}
            {status === 'idle' && (
              <p className="text-xs text-gray-400">Pre-caches all 331 question images</p>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
