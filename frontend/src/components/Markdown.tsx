import ReactMarkdown, { type Components } from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

type Props = {
  children: string
  className?: string
}

// GFM — таблицы, списки задач, зачёркивание; breaks — перенос строки без пустой строки, как в обычном тексте
const remarkPlugins = [remarkGfm, remarkBreaks]

const components: Components = {
  // Ссылки из заметок ведут наружу — открываем в новой вкладке
  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
}

/**
 * Markdown заметки. Сырой HTML не рендерится, опасные ссылки (javascript: и т.п.)
 * react-markdown вырезает сам, поэтому текст от пользователя безопасен.
 */
export function Markdown({ children, className = '' }: Props) {
  return (
    <div className={`markdown ${className}`}>
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
