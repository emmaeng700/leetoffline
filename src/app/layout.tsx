import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SwRegister from './sw-register'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LeetOffline',
  description: 'Offline flashcards and line game for LeetCode practice',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SwRegister />
        {children}
      </body>
    </html>
  )
}
