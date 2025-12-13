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
          padding: 'var(--spacing-md) var(--spacing-lg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-secondary)',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary-light)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
      >
        <span style={{ 
          color: selectedLanguages.length === 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
          fontWeight: selectedLanguages.length === 0 ? '400' : '500'
        }}>
          {selectedLanguages.length === 0
            ? 'Select programming languages...'
            : `${selectedLanguages.length} language${selectedLanguages.length > 1 ? 's' : ''} selected`}
        </span>
        <span style={{ 
          color: 'var(--primary)',
          fontSize: '0.8rem',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>▼</span>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 'var(--spacing-sm)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-secondary)',
            backdropFilter: 'blur(10px)',
            boxShadow: 'var(--shadow-xl)',
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
              padding: 'var(--spacing-md)',
              border: 'none',
              borderBottom: '1px solid var(--border-color-light)',
              fontSize: '0.9rem',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            onClick={e => e.stopPropagation()}
          />
          <div style={{ padding: 'var(--spacing-sm)' }}>
            {filteredLanguages.map(lang => (
              <label
                key={lang}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: selectedLanguages.includes(lang) 
                    ? 'rgba(99, 102, 241, 0.15)' 
                    : 'transparent',
                  transition: 'all 0.2s ease',
                  marginBottom: '2px',
                }}
                onMouseEnter={(e) => {
                  if (!selectedLanguages.includes(lang)) {
                    e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedLanguages.includes(lang)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
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
                  style={{ 
                    marginRight: 'var(--spacing-sm)',
                    accentColor: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ 
                  color: selectedLanguages.includes(lang) ? 'var(--primary-dark)' : 'var(--text-primary)',
                  fontWeight: selectedLanguages.includes(lang) ? '500' : '400'
                }}>
                  {lang}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selectedLanguages.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
          {selectedLanguages.map(lang => (
            <span
              key={lang}
              style={{
                padding: 'var(--spacing-xs) var(--spacing-md)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                fontWeight: '500',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {lang}
              <button
                onClick={() => {
                  onChange(selectedLanguages.filter(l => l !== lang))
                  onUpdate()
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                  padding: '0 4px',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
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

