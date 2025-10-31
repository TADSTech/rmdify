import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import { Save, FileDown, Eye, Edit3, X, Menu } from 'lucide-react'
import { jsPDF } from 'jspdf'
import MarkdownIt from 'markdown-it'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface NewDocMobileProps {
  initialDocId?: string | null
}

interface SavedDocument {
  id: string
  title: string
  content: string
  lastModified: number
}

export default function NewDocMobile({ initialDocId }: NewDocMobileProps) {
  const [markdownContent, setMarkdownContent] = useState('')
  const [title, setTitle] = useState('Untitled Document')
  const [documentId, setDocumentId] = useState(`doc-${Date.now()}`)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFileName, setExportFileName] = useState('document')
  const [exportFormat, setExportFormat] = useState<'md' | 'txt' | 'html' | 'pdf'>('md')
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (initialDocId) {
      const savedDoc = localStorage.getItem(`rmdify-${initialDocId}`)
      if (savedDoc) {
        try {
          const doc: SavedDocument = JSON.parse(savedDoc)
          setTitle(doc.title)
          setMarkdownContent(doc.content)
          setDocumentId(doc.id)
          setSaveStatus('saved')
        } catch (e) {
          console.error('Error loading document:', e)
        }
      }
    }
  }, [initialDocId])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (saveStatus === 'unsaved') {
        handleSave()
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [markdownContent, title, saveStatus])

  useEffect(() => {
    if (saveStatus === 'saved') {
      setSaveStatus('unsaved')
    }
  }, [markdownContent, title])

  const handleSave = () => {
    setSaveStatus('saving')
    
    const doc: SavedDocument = {
      id: documentId,
      title,
      content: markdownContent,
      lastModified: Date.now()
    }

    localStorage.setItem(`rmdify-${documentId}`, JSON.stringify(doc))

    const docsListStr = localStorage.getItem('rmdify-docs-list')
    let docsList: string[] = docsListStr ? JSON.parse(docsListStr) : []
    
    if (!docsList.includes(documentId)) {
      docsList.push(documentId)
      localStorage.setItem('rmdify-docs-list', JSON.stringify(docsList))
    }

    setTimeout(() => {
      setSaveStatus('saved')
    }, 500)
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
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
          }
          pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
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

  const handleExport = () => {
    setExportFileName(title.replace(/[^a-z0-9]/gi, '_').toLowerCase())
    setShowExportDialog(true)
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
      {/* Mobile Header */}
      <div className="shrink-0 border-b px-4 py-3 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded"
          style={{ color: 'var(--text)' }}
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-bold bg-transparent border-none outline-none text-center flex-1 mx-2"
          style={{ color: 'var(--text)' }}
        />
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="p-2 rounded"
            style={{ color: saveStatus === 'saved' ? 'var(--color-accent)' : 'var(--text-muted)' }}
          >
            <Save className="h-5 w-5" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded"
            style={{ color: 'var(--text)' }}
          >
            <FileDown className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="shrink-0 px-4 py-2 text-xs" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
        {saveStatus === 'saved' && '✓ Saved'}
        {saveStatus === 'saving' && 'Saving...'}
        {saveStatus === 'unsaved' && 'Unsaved changes'}
      </div>

      {/* Tab Switcher */}
      <div className="shrink-0 flex border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setActiveTab('editor')}
          className="flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors"
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
          className="flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors"
          style={{
            color: activeTab === 'preview' ? 'var(--color-accent)' : 'var(--text-muted)',
            borderBottom: activeTab === 'preview' ? '2px solid var(--color-accent)' : 'none',
          }}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === 'editor' ? (
          <textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            placeholder="Start writing in Markdown..."
            className="w-full h-full p-4 resize-none outline-none font-mono text-sm"
            style={{ 
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              border: 'none'
            }}
          />
        ) : (
          <div className="p-4">
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

      {/* Export Dialog */}
      {showExportDialog && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setExportFormat('md')}
                    className="px-4 py-2 rounded-lg border transition-colors text-sm"
                    style={{
                      backgroundColor: exportFormat === 'md' ? 'var(--color-accent)' : 'var(--bg)',
                      borderColor: exportFormat === 'md' ? 'var(--color-accent)' : 'var(--border)',
                      color: exportFormat === 'md' ? '#000' : 'var(--text)',
                    }}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setExportFormat('txt')}
                    className="px-4 py-2 rounded-lg border transition-colors text-sm"
                    style={{
                      backgroundColor: exportFormat === 'txt' ? 'var(--color-accent)' : 'var(--bg)',
                      borderColor: exportFormat === 'txt' ? 'var(--color-accent)' : 'var(--border)',
                      color: exportFormat === 'txt' ? '#000' : 'var(--text)',
                    }}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setExportFormat('html')}
                    className="px-4 py-2 rounded-lg border transition-colors text-sm"
                    style={{
                      backgroundColor: exportFormat === 'html' ? 'var(--color-accent)' : 'var(--bg)',
                      borderColor: exportFormat === 'html' ? 'var(--color-accent)' : 'var(--border)',
                      color: exportFormat === 'html' ? '#000' : 'var(--text)',
                    }}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setExportFormat('pdf')}
                    className="px-4 py-2 rounded-lg border transition-colors text-sm"
                    style={{
                      backgroundColor: exportFormat === 'pdf' ? 'var(--color-accent)' : 'var(--bg)',
                      borderColor: exportFormat === 'pdf' ? 'var(--color-accent)' : 'var(--border)',
                      color: exportFormat === 'pdf' ? '#000' : 'var(--text)',
                    }}
                  >
                    PDF
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
