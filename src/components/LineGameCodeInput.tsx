'use client'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  completionContext?: string
}

export default function LineGameCodeInput({ value, onChange, placeholder, className }: Props) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = value.substring(0, start) + '    ' + value.substring(end)
      onChange(next)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4
      })
    }
  }

  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      rows={1}
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      className={`w-full bg-transparent text-[#abb2bf] font-mono text-[12px] sm:text-[13px] leading-relaxed px-2 py-1 resize-none outline-none placeholder-[#5c6370] ${className ?? ''}`}
      style={{ minHeight: '2rem', fieldSizing: 'content' as never }}
    />
  )
}
