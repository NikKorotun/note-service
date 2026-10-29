import MDEditor, {
  bold,
  checkedListCommand,
  code,
  codeBlock,
  codeEdit,
  codeLive,
  codePreview,
  divider,
  fullscreen,
  hr,
  italic,
  link,
  orderedListCommand,
  quote,
  strikethrough,
  table,
  title,
  unorderedListCommand,
  type ICommand,
} from '@uiw/react-md-editor/nohighlight'
import { Markdown } from './Markdown'

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  maxLength: number
  invalid?: boolean
}

// Подписи кнопок у редактора только на английском и китайском
function translate(command: ICommand, label: string): ICommand {
  return { ...command, buttonProps: { ...command.buttonProps, title: label, 'aria-label': label } }
}

const commands = [
  translate(bold, 'Жирный (Ctrl+B)'),
  translate(italic, 'Курсив (Ctrl+I)'),
  translate(strikethrough, 'Зачёркнутый (Ctrl+Shift+X)'),
  divider,
  translate(title, 'Заголовок'),
  translate(link, 'Ссылка (Ctrl+L)'),
  translate(quote, 'Цитата (Ctrl+Q)'),
  translate(code, 'Код (Ctrl+J)'),
  translate(codeBlock, 'Блок кода (Ctrl+Shift+J)'),
  divider,
  translate(unorderedListCommand, 'Маркированный список (Ctrl+Shift+U)'),
  translate(orderedListCommand, 'Нумерованный список (Ctrl+Shift+O)'),
  translate(checkedListCommand, 'Список задач (Ctrl+Shift+C)'),
  translate(table, 'Таблица'),
  translate(hr, 'Разделитель (Ctrl+H)'),
]

const extraCommands = [
  translate(codeEdit, 'Только текст (Ctrl+7)'),
  translate(codeLive, 'Текст и просмотр (Ctrl+8)'),
  translate(codePreview, 'Только просмотр (Ctrl+9)'),
  divider,
  translate(fullscreen, 'Во весь экран (Ctrl+0)'),
]

/**
 * Редактор Markdown на @uiw/react-md-editor. Просмотр рендерится тем же компонентом,
 * что и карточка заметки, поэтому выглядит и экранируется одинаково.
 */
export function MarkdownEditor({ id, value, onChange, maxLength, invalid = false }: Props) {
  return (
    <div className={`md-editor ${invalid ? 'md-editor-invalid' : ''}`}>
      <MDEditor
        value={value}
        onChange={(next) => onChange(next ?? '')}
        commands={commands}
        extraCommands={extraCommands}
        components={{ preview: (source) => <Markdown className="text-sm text-muted">{source}</Markdown> }}
        preview="edit"
        height={220}
        minHeight={140}
        maxHeight={600}
        // Tab переводит фокус, а не вставляет отступ: иначе с клавиатуры из поля внутри модалки не выйти
        defaultTabEnable
        textareaProps={{
          id,
          maxLength,
          placeholder: 'Текст заметки',
          'aria-invalid': invalid,
        }}
      />
    </div>
  )
}
