'use client'

import { useState, useEffect, useRef } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const COMMON_LANGUAGES = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'Go',
  'Rust',
  'C++',
  'C',
  'C#',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'Dart',
  'HTML',
  'CSS',
  'Shell',
  'PowerShell',
  'GDScript',
  'GLSL',
  'Haskell',
  'R',
  'Scala',
  'Clojure',
  'Elixir',
  'Erlang',
  'Lua',
  'Perl',
  'MATLAB',
  'Julia',
]

interface LanguagePickerProps {
  selectedLanguages: string[]
  onChange: (languages: string[]) => void
  onUpdate: () => void
}

export default function LanguagePicker({ selectedLanguages, onChange, onUpdate }: LanguagePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredLanguages = COMMON_LANGUAGES.filter(lang =>
    lang.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleLanguage = (lang: string) => {
    const newSelection = selectedLanguages.includes(lang)
      ? selectedLanguages.filter(l => l !== lang)
      : [...selectedLanguages, lang]
    onChange(newSelection)
    onUpdate()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Auto-focus search input when popover opens
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard navigation in language list
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <div className="relative">
            <div className="px-4 py-3 border border-border rounded-lg bg-card/50 backdrop-blur-sm cursor-pointer flex justify-between items-center shadow-md transition-all hover:border-primary/50 hover:shadow-lg min-h-[72px]">
              <span className={cn(
                selectedLanguages.length === 0 ? 'text-muted-foreground' : 'text-foreground',
                selectedLanguages.length === 0 ? 'font-normal' : 'font-medium'
              )}>
                {selectedLanguages.length === 0
                  ? 'Select programming languages...'
                  : `${selectedLanguages.length} language${selectedLanguages.length > 1 ? 's' : ''} selected`}
              </span>
              <span className={cn(
                "text-primary text-xs transition-transform",
                isOpen && "rotate-180"
              )}>▼</span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 max-h-[300px] overflow-y-auto">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search languages... (Type to filter)"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="rounded-none border-0 border-b rounded-t-lg"
            onClick={e => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false)
                setSearchTerm('')
              }
            }}
            aria-label="Search programming languages"
          />
          <div className="p-1">
            {filteredLanguages.map(lang => (
              <label
                key={lang}
                className={cn(
                  "flex items-center px-3 py-2 cursor-pointer rounded-md transition-colors mb-0.5",
                  selectedLanguages.includes(lang)
                    ? "bg-primary/15"
                    : "hover:bg-primary/5"
                )}
              >
                <Checkbox
                  checked={selectedLanguages.includes(lang)}
                  onChange={() => toggleLanguage(lang)}
                  className="mr-2"
                />
                <span className={cn(
                  selectedLanguages.includes(lang) ? 'text-primary font-medium' : 'text-foreground font-normal'
                )}>
                  {lang}
                </span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {selectedLanguages.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedLanguages.map(lang => (
            <Badge
              key={lang}
              variant="default"
              className="px-3 py-1 text-sm font-medium flex items-center gap-1"
            >
              {lang}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-primary-foreground/20 text-primary-foreground"
                onClick={() => {
                  onChange(selectedLanguages.filter(l => l !== lang))
                  onUpdate()
                }}
              >
                ×
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
