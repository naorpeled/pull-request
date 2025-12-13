declare module 'react-markdown' {
  import * as React from 'react'

  interface ReactMarkdownProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
    remarkPlugins?: any
    components?: Record<string, React.ElementType>
  }

  export default function ReactMarkdown(props: ReactMarkdownProps): JSX.Element
}

declare module 'remark-gfm' {
  const remarkGfm: any
  export default remarkGfm
}

