import Link from 'next/link'
import { Layers, Gamepad2 } from 'lucide-react'

export default function Home() {
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
    </div>
  )
}
