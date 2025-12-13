'use client'

import { useState, useEffect } from 'react'

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

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>
          {selectedLanguages.length === 0
            ? 'Select programming languages...'
            : `${selectedLanguages.length} language${selectedLanguages.length > 1 ? 's' : ''} selected`}
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          <input
            type="text"
            placeholder="Search languages..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: 'none',
              borderBottom: '1px solid #ddd',
              fontSize: '0.9rem',
            }}
            onClick={e => e.stopPropagation()}
          />
          <div style={{ padding: '8px' }}>
            {filteredLanguages.map(lang => (
              <label
                key={lang}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  backgroundColor: selectedLanguages.includes(lang) ? '#e3f2fd' : 'transparent',
                }}
                onClick={e => {
                  e.stopPropagation()
                  toggleLanguage(lang)
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(lang)}
                  onChange={() => toggleLanguage(lang)}
                  style={{ marginRight: '8px' }}
                />
                {lang}
              </label>
            ))}
          </div>
        </div>
      )}

      {selectedLanguages.length > 0 && (
        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {selectedLanguages.map(lang => (
            <span
              key={lang}
              style={{
                padding: '4px 12px',
                backgroundColor: '#0070f3',
                color: 'white',
                borderRadius: '16px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {lang}
              <button
                onClick={() => {
                  onChange(selectedLanguages.filter(l => l !== lang))
                  onUpdate()
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                  padding: 0,
                  marginLeft: '4px',
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

