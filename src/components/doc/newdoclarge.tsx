import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import { Save, FileDown, Eye, Edit3, X } from 'lucide-react'
import { jsPDF } from 'jspdf'
import MarkdownIt from 'markdown-it'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface SavedDocument {
  id: string
  title: string
  content: string
  lastModified: number
}

type ExportFormat = 'md' | 'txt' | 'html' | 'pdf'

interface NewDocLargeProps {
  initialDocId?: string | null
}

const NewDocLarge: React.FC<NewDocLargeProps> = ({ initialDocId }) => {
  const [markdownContent, setMarkdownContent] = useState<string>('# New Document\n\nStart writing your markdown here...\n\n## Features\n\n- **Bold text**\n- *Italic text*\n- `Code snippets`\n\n```javascript\nconst hello = "world";\nconsole.log(hello);\n```')
  const [title, setTitle] = useState<string>('Untitled Document')
  const [documentId] = useState<string>(() => initialDocId || `doc-${Date.now()}`)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('unsaved')
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFileName, setExportFileName] = useState('')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('md')

  useEffect(() => {
    const savedDoc = localStorage.getItem(`rmdify-${documentId}`)
    if (savedDoc) {
      try {
        const doc: SavedDocument = JSON.parse(savedDoc)
        setTitle(doc.title)
        setMarkdownContent(doc.content)
        setSaveStatus('saved')
      } catch (e) {
        console.error('Error loading document:', e)
      }
    }
  }, [documentId])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (saveStatus === 'unsaved') {
        handleSave()
      }
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [markdownContent, title, saveStatus])

  useEffect(() => {
    setSaveStatus('unsaved')
  }, [markdownContent, title])

  const handleSave = () => {
    setSaveStatus('saving')
    const document: SavedDocument = {
      id: documentId,
      title,
      content: markdownContent,
      lastModified: Date.now()
    }
    
    try {
      localStorage.setItem(`rmdify-${documentId}`, JSON.stringify(document))
      
      const docsListStr = localStorage.getItem('rmdify-docs-list')
      let docsList: string[] = docsListStr ? JSON.parse(docsListStr) : []
      
      if (!docsList.includes(documentId)) {
        docsList.push(documentId)
        localStorage.setItem('rmdify-docs-list', JSON.stringify(docsList))
      }
      
      console.log('Document saved:', document)
      setSaveStatus('saved')
      
      setTimeout(() => {
        if (saveStatus === 'saved') {
          setSaveStatus('saved')
        }
      }, 2000)
    } catch (e) {
      console.error('Error saving document:', e)
      alert('Failed to save document. Storage might be full.')
    }
  }

  const handleExport = () => {
    const defaultFileName = title.replace(/\s+/g, '-').toLowerCase()
    setExportFileName(defaultFileName)
    setShowExportDialog(true)
  }

  const convertToHTML = (markdown: string): string => {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    })
    
    const htmlContent = md.render(markdown)
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
            max-width: 800px; 
            margin: 40px auto; 
            padding: 20px; 
            line-height: 1.6; 
            color: #333; 
          }
          code { 
            background: #f4f4f4; 
            padding: 2px 6px; 
            border-radius: 3px; 
            font-family: 'Courier New', monospace; 
            font-size: 0.9em;
          }
          pre { 
            background: #f4f4f4; 
            padding: 16px; 
            border-radius: 6px; 
            overflow-x: auto; 
          }
          pre code { 
            background: none; 
            padding: 0; 
          }
          h1, h2, h3, h4, h5, h6 { 
            margin-top: 24px; 
            margin-bottom: 16px; 
            font-weight: 600;
          }
          h1 { font-size: 2em; }
          h2 { font-size: 1.5em; }
          h3 { font-size: 1.25em; }
          blockquote { 
            border-left: 4px solid #ddd; 
            margin: 0; 
            padding-left: 16px; 
            color: #666; 
          }
          ul, ol { 
            padding-left: 24px; 
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `
  }

  const convertToPDF = async (markdown: string, fileName: string) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - (margin * 2)
    let yPosition = margin

    const lines = markdown.split('\n')
    
    for (const line of lines) {
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }

      if (line.startsWith('# ')) {
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        const text = line.substring(2)
        doc.text(text, margin, yPosition)
        yPosition += 12
      } else if (line.startsWith('## ')) {
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        const text = line.substring(3)
        doc.text(text, margin, yPosition)
        yPosition += 10
      } else if (line.startsWith('### ')) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        const text = line.substring(4)
        doc.text(text, margin, yPosition)
        yPosition += 8
      } else if (line.startsWith('```')) {
        continue
      } else if (line.trim() === '') {
        yPosition += 5
      } else {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        
        let processedLine = line
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '$1')
        processedLine = processedLine.replace(/\*(.*?)\*/g, '$1')
        processedLine = processedLine.replace(/`(.*?)`/g, '$1')
        processedLine = processedLine.replace(/^\s*[-*+]\s+/, '• ')
        processedLine = processedLine.replace(/^\s*\d+\.\s+/, '')
        
        const splitText = doc.splitTextToSize(processedLine, maxWidth)
        doc.text(splitText, margin, yPosition)
        yPosition += splitText.length * 6
      }
    }

    doc.save(fileName)
  }

  const executeExport = async () => {
    let content = markdownContent
    let mimeType = 'text/markdown'
    const fileName = `${exportFileName}.${exportFormat}`

    switch (exportFormat) {
      case 'txt':
        mimeType = 'text/plain'
        break
      case 'html':
        content = convertToHTML(markdownContent)
        mimeType = 'text/html'
        break
      case 'pdf':
        await convertToPDF(markdownContent, fileName)
        setShowExportDialog(false)
        return
      case 'md':
      default:
        mimeType = 'text/markdown'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setShowExportDialog(false)
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-accent/50 rounded px-2 py-1"
          style={{ color: 'var(--text)' }}
        />
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {saveStatus === 'saved' && '✓ Saved'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'unsaved' && 'Unsaved changes'}
          </span>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
          >
            <Save className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FileDown className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="flex px-4">
          <button
            onClick={() => setActiveTab('editor')}
            className="flex items-center gap-2 px-4 py-3 font-medium transition-colors"
            style={{
              color: activeTab === 'editor' ? 'var(--color-accent)' : 'var(--text-muted)',
              borderBottom: activeTab === 'editor' ? '2px solid var(--color-accent)' : 'none',
            }}
          >
            <Edit3 className="h-4 w-4" />
            Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className="flex items-center gap-2 px-4 py-3 font-medium transition-colors"
            style={{
              color: activeTab === 'preview' ? 'var(--color-accent)' : 'var(--text-muted)',
              borderBottom: activeTab === 'preview' ? '2px solid var(--color-accent)' : 'none',
            }}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'editor' ? (
          <textarea
            className="w-full h-full p-6 border-none outline-none resize-none font-mono text-sm"
            style={{ 
              backgroundColor: 'var(--bg)', 
              color: 'var(--text)',
            }}
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            placeholder="Start typing your markdown here..."
          />
        ) : (
          <div className="h-full overflow-auto p-6">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <Markdown
                components={{
                  code(props) {
                    const {children, className} = props
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match && !className
                    const language = match ? match[1] : 'text'
                    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark'
                    
                    if (isInline) {
                      return (
                        <code 
                          className="px-1.5 py-0.5 rounded text-sm font-mono"
                          style={{ 
                            backgroundColor: isDarkMode ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                            color: 'var(--color-accent)'
                          }}
                        >
                          {children}
                        </code>
                      )
                    }
                    
                    return (
                      <SyntaxHighlighter
                        language={language}
                        style={isDarkMode ? (oneDark as any) : (oneLight as any)}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    )
                  },
                  pre(props) {
                    return <>{props.children}</>
                  }
                }}
              >
                {markdownContent}
              </Markdown>
            </div>
          </div>
        )}
      </div>

      {showExportDialog && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={() => setShowExportDialog(false)}
        >
          <div 
            className="rounded-lg p-6 w-full max-w-md"
            style={{ 
              backgroundColor: 'var(--bg)', 
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                Export Document
              </h2>
              <button
                onClick={() => setShowExportDialog(false)}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--text)', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  File Name
                </label>
                <input
                  type="text"
                  value={exportFileName}
                  onChange={(e) => setExportFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-accent/50"
                  style={{ 
                    backgroundColor: 'var(--bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)' 
                  }}
                  placeholder="my-document"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setExportFormat('md')}
                    className="px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: exportFormat === 'md' ? 'var(--color-accent)' : 'var(--bg)',
                      borderColor: exportFormat === 'md' ? 'var(--color-accent)' : 'var(--border)',
                      color: exportFormat === 'md' ? '#000' : 'var(--text)',
                    }}
                  >
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => setExportFormat('txt')}
                    className="px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: exportFormat === 'txt' ? 'var(--color-accent)' : 'var(--bg)',
                      borderColor: exportFormat === 'txt' ? 'var(--color-accent)' : 'var(--border)',
                      color: exportFormat === 'txt' ? '#000' : 'var(--text)',
                    }}
                  >
                    Text (.txt)
                  </button>
                  <button
                    onClick={() => setExportFormat('html')}
                    className="px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: exportFormat === 'html' ? 'var(--color-accent)' : 'var(--bg)',
                      borderColor: exportFormat === 'html' ? 'var(--color-accent)' : 'var(--border)',
                      color: exportFormat === 'html' ? '#000' : 'var(--text)',
                    }}
                  >
                    HTML (.html)
                  </button>
                  <button
                    onClick={() => setExportFormat('pdf')}
                    className="px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: exportFormat === 'pdf' ? 'var(--color-accent)' : 'var(--bg)',
                      borderColor: exportFormat === 'pdf' ? 'var(--color-accent)' : 'var(--border)',
                      color: exportFormat === 'pdf' ? '#000' : 'var(--text)',
                    }}
                  >
                    PDF (.pdf)
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setShowExportDialog(false)}
                  className="px-4 py-2 rounded-lg border transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  onClick={executeExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--color-accent)', color: '#000' }}
                >
                  <FileDown className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewDocLarge
