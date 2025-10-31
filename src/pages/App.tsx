import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar'
import { useState } from 'react'
import { FilePlus, FolderOpen, Clock, Star, Trash2, BookOpen } from 'lucide-react'
import NewDocLarge from '../components/doc/newdoclarge'
import Dialog from '../components/ui/dialog'

interface SavedDocument {
  id: string
  title: string
  content: string
  lastModified: number
}

type ViewType = 'welcome' | 'newdoc' | 'recent' | 'starred'

export default function MainApp() {
  const [open, setOpen] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('welcome')
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)

  const handleNewDocument = () => {
    console.log('Creating new document...')
    setSelectedDocId(null)
    setCurrentView('newdoc')
  }

  const handleOpenDocument = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.txt'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          const docId = `doc-${Date.now()}`
          const doc: SavedDocument = {
            id: docId,
            title: file.name.replace(/\.(md|txt)$/, ''),
            content,
            lastModified: Date.now()
          }
          
          localStorage.setItem(`rmdify-${docId}`, JSON.stringify(doc))
          
          const docsListStr = localStorage.getItem('rmdify-docs-list')
          let docsList: string[] = docsListStr ? JSON.parse(docsListStr) : []
          docsList.push(docId)
          localStorage.setItem('rmdify-docs-list', JSON.stringify(docsList))
          
          setSelectedDocId(docId)
          setCurrentView('newdoc')
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleRecentDocuments = () => {
    console.log('Showing recent documents...')
    setCurrentView('recent')
  }

  const handleStarredDocuments = () => {
    console.log('Showing starred documents...')
    setCurrentView('starred')
  }

  const loadDocument = (docId: string) => {
    setSelectedDocId(docId)
    setCurrentView('newdoc')
  }

  const deleteDocument = (docId: string) => {
    setDocumentToDelete(docId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!documentToDelete) return

    localStorage.removeItem(`rmdify-${documentToDelete}`)
    
    const docsListStr = localStorage.getItem('rmdify-docs-list')
    if (docsListStr) {
      let docsList: string[] = JSON.parse(docsListStr)
      docsList = docsList.filter(id => id !== documentToDelete)
      localStorage.setItem('rmdify-docs-list', JSON.stringify(docsList))
    }
    
    const starredStr = localStorage.getItem('rmdify-starred')
    if (starredStr) {
      let starred: string[] = JSON.parse(starredStr)
      starred = starred.filter(id => id !== documentToDelete)
      localStorage.setItem('rmdify-starred', JSON.stringify(starred))
    }
    
    setRefreshKey(prev => prev + 1)
    setDeleteDialogOpen(false)
    setDocumentToDelete(null)
  }

  const toggleStar = (docId: string) => {
    const starredStr = localStorage.getItem('rmdify-starred')
    let starred: string[] = starredStr ? JSON.parse(starredStr) : []
    
    if (starred.includes(docId)) {
      starred = starred.filter(id => id !== docId)
    } else {
      starred.push(docId)
    }
    
    localStorage.setItem('rmdify-starred', JSON.stringify(starred))
    
    setRefreshKey(prev => prev + 1)
  }

  const getDocuments = (): SavedDocument[] => {
    const docsListStr = localStorage.getItem('rmdify-docs-list')
    if (!docsListStr) return []
    
    const docsList: string[] = JSON.parse(docsListStr)
    const documents: SavedDocument[] = []
    
    for (const docId of docsList) {
      const docStr = localStorage.getItem(`rmdify-${docId}`)
      if (docStr) {
        try {
          documents.push(JSON.parse(docStr))
        } catch (e) {
          console.error('Error parsing document:', e)
        }
      }
    }
    
    return documents.sort((a, b) => b.lastModified - a.lastModified)
  }

  const getStarredDocuments = (): SavedDocument[] => {
    const starredStr = localStorage.getItem('rmdify-starred')
    if (!starredStr) return []
    
    const starred: string[] = JSON.parse(starredStr)
    const documents: SavedDocument[] = []
    
    for (const docId of starred) {
      const docStr = localStorage.getItem(`rmdify-${docId}`)
      if (docStr) {
        try {
          documents.push(JSON.parse(docStr))
        } catch (e) {
          console.error('Error parsing document:', e)
        }
      }
    }
    
    return documents.sort((a, b) => b.lastModified - a.lastModified)
  }

  const isStarred = (docId: string): boolean => {
    const starredStr = localStorage.getItem('rmdify-starred')
    if (!starredStr) return false
    const starred: string[] = JSON.parse(starredStr)
    return starred.includes(docId)
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    
    return date.toLocaleDateString()
  }

  const DocumentList = ({ documents, title }: { documents: SavedDocument[], title: string }) => (
    <div className="h-full overflow-auto p-8">
      <h1 className="text-4xl mb-6 font-bold">{title}</h1>
      {documents.length === 0 ? (
        <p className="text-muted">No documents found.</p>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border rounded-lg p-4 hover:border-accent transition-all duration-200 cursor-pointer"
              style={{ 
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1" onClick={() => loadDocument(doc.id)}>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                    {doc.title}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                    {doc.content.substring(0, 150)}...
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Last modified: {formatDate(doc.lastModified)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleStar(doc.id)
                    }}
                    className="p-2 rounded transition-colors"
                    style={{
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Star
                      className="h-5 w-5"
                      style={{ 
                        color: isStarred(doc.id) ? 'var(--color-accent)' : 'var(--text-muted)',
                        fill: isStarred(doc.id) ? 'var(--color-accent)' : 'none'
                      }}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteDocument(doc.id)
                    }}
                    className="p-2 rounded transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                      e.currentTarget.style.color = '#ef4444'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--text-muted)'
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const links = [
    { label: 'New Document', href: '#', icon: <FilePlus className="h-5 w-5" />, onClick: handleNewDocument },
    { label: 'Open Document', href: '#', icon: <FolderOpen className="h-5 w-5" />, onClick: handleOpenDocument },
    { label: 'Recent Documents', href: '#', icon: <Clock className="h-5 w-5" />, onClick: handleRecentDocuments },
    { label: 'Starred Documents', href: '#', icon: <Star className="h-5 w-5" />, onClick: handleStarredDocuments },
    { label: 'Markdown Guide', href: 'https://www.markdownguide.org/basic-syntax/', icon: <BookOpen className="h-5 w-5" />, onClick: () => window.open('https://www.markdownguide.org/basic-syntax/', '_blank') },
  ]

  return (
    <div className="h-screen flex">
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className="justify-between gap-10 h-full">
          <div className="flex flex-col gap-2 flex-1">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
          <div className="text-xs text-muted">Rmdify v1.0</div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        {currentView === 'welcome' ? (
          <div className="p-8">
            <h1 className="text-4xl mb-4 font-bold">Welcome to Rmdify</h1>
            <p className="text-muted mb-6">Desktop version - Use the sidebar to navigate.</p>
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
              <ul className="space-y-2 text-muted">
                <li>• Click "New Document" to create a markdown file</li>
                <li>• Use "Open Document" to load an existing file</li>
                <li>• Access your recent and starred documents from the sidebar</li>
              </ul>
            </div>
          </div>
        ) : currentView === 'newdoc' ? (
          <NewDocLarge key={selectedDocId || 'new'} initialDocId={selectedDocId} />
        ) : currentView === 'recent' ? (
          <DocumentList key={`recent-${refreshKey}`} documents={getDocuments()} title="Recent Documents" />
        ) : currentView === 'starred' ? (
          <DocumentList key={`starred-${refreshKey}`} documents={getStarredDocuments()} title="Starred Documents" />
        ) : null}
      </main>
      
      <Dialog
        isOpen={deleteDialogOpen}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false)
          setDocumentToDelete(null)
        }}
      />
    </div>
  )
}
