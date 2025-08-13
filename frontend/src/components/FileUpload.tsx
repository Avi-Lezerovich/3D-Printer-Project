import { useState, useRef } from 'react'
import { useAppStore } from '../shared/store'

export default function FileUpload() {
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addJob = useAppStore(s => s.addJob)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files).filter(file => 
      file.name.toLowerCase().endsWith('.gcode') || 
      file.name.toLowerCase().endsWith('.stl')
    )
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // Add to job queue
    newFiles.forEach(file => {
      addJob({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        progress: 0,
        status: 'queued'
      })
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="panel">
      <h2>File Upload</h2>
      
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent)' : '#123a56'}`,
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
          cursor: 'pointer',
          marginTop: 12,
          background: dragOver ? 'rgba(0, 174, 240, 0.1)' : 'transparent',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
        <div>
          <strong>Drop files here or click to browse</strong>
        </div>
        <div style={{ color: 'var(--muted)', marginTop: 8 }}>
          Supports .gcode and .stl files
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".gcode,.stl"
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
      />

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Uploaded Files</h3>
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="panel"
                style={{ 
                  background: '#09121a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{file.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 14 }}>
                    {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  style={{
                    background: 'var(--bad)',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 12px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  aria-label={`Remove ${file.name}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
