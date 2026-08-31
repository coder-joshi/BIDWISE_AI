import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, FileText, X, CheckCircle2, AlertCircle, Loader2,
  Cloud, FileType, HardDrive, ChevronRight, Info
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { TENDER } from '../../data/dummyData'

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_SIZE_MB = 25

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadBidPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef()
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState('')
  const [error, setError] = useState('')

  const addFiles = useCallback((newFiles) => {
    setError('')
    const validated = Array.from(newFiles).map((file) => {
      const sizeOk = file.size <= MAX_SIZE_MB * 1024 * 1024
      const typeOk = ACCEPTED_TYPES.includes(file.type)
      return {
        file,
        id: `${file.name}-${Date.now()}`,
        error: !typeOk ? 'Unsupported file type (PDF/DOCX only)' : !sizeOk ? `File exceeds ${MAX_SIZE_MB}MB limit` : null,
      }
    })
    setFiles((prev) => [...prev, ...validated])
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true) }
  const handleDragLeave = () => setDragActive(false)

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const startVerification = async () => {
    const validFiles = files.filter((f) => !f.error)
    if (!validFiles.length) { setError('Add at least one valid PDF or DOCX file.'); return }

    setUploading(true)
    const stages = [
      [10, 'Uploading documents…'],
      [30, 'Reading file contents…'],
      [55, 'Initialising AI pipeline…'],
      [80, 'Queuing for OCR…'],
      [100, 'Upload complete!'],
    ]
    for (const [pct, label] of stages) {
      await new Promise(r => setTimeout(r, 500))
      setUploadProgress(pct)
      setUploadStage(label)
    }
    await new Promise(r => setTimeout(r, 600))
    navigate('/processing')
  }

  const hasValid = files.some((f) => !f.error)

  return (
    <div className="p-6 lg:p-8 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gem-white">Upload Bid Package</h1>
        <p className="text-gem-muted font-body text-sm mt-1">
          Upload bid documents for AI-powered compliance verification
        </p>
      </div>

      {/* Tender context */}
      <div className="glass-card p-4 mb-6 flex flex-wrap gap-4 items-start">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-gem-blue-light flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gem-muted font-body uppercase tracking-wide">Active Tender</p>
            <p className="text-sm font-semibold text-gem-white font-mono">{TENDER.id}</p>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gem-muted font-body uppercase tracking-wide">Tender Title</p>
          <p className="text-sm font-semibold text-gem-white font-body truncate">{TENDER.title}</p>
        </div>
        <div>
          <p className="text-[10px] text-gem-muted font-body uppercase tracking-wide">Deadline</p>
          <p className="text-sm font-semibold text-gem-amber font-body">{TENDER.deadline}</p>
        </div>
      </div>

      {/* Drop zone */}
      {!uploading && (
        <>
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
              dragActive
                ? 'border-gem-blue bg-gem-blue/10 scale-[1.01]'
                : 'border-white/15 hover:border-gem-blue/50 hover:bg-gem-blue/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all ${
              dragActive ? 'bg-gem-blue/25 shadow-gem-glow' : 'bg-gem-blue/10'
            }`}>
              <Cloud size={28} className={dragActive ? 'text-gem-blue-light' : 'text-gem-muted'} />
            </div>

            <h3 className="font-display font-semibold text-gem-white text-lg mb-1">
              {dragActive ? 'Drop files here' : 'Drag & drop bid documents'}
            </h3>
            <p className="text-gem-muted font-body text-sm mb-3">
              or <span className="text-gem-blue-light underline">browse to select files</span>
            </p>
            <p className="text-xs text-gem-muted font-body">
              PDF · DOCX · Max {MAX_SIZE_MB}MB per file · Multiple files supported
            </p>
          </div>

          {/* What to upload hint */}
          <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-gem-blue/8 border border-gem-blue/20">
            <Info size={14} className="text-gem-blue-light flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gem-muted font-body">
              Include: GST Certificate, PAN card, Udyam Certificate, ISO Certificate, Experience Certificates, Bank Solvency Letter, OEM Authorization.
            </p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold text-gem-muted font-body uppercase tracking-wide mb-2">
                Selected Files ({files.length})
              </p>
              {files.map(({ id, file, error: fileError }) => (
                <div
                  key={id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    fileError
                      ? 'bg-gem-red/8 border-gem-red/25'
                      : 'bg-white/4 border-white/8 hover:bg-white/6'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    fileError ? 'bg-gem-red/15' : 'bg-gem-blue/15'
                  }`}>
                    <FileType size={14} className={fileError ? 'text-gem-red' : 'text-gem-blue-light'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gem-white font-body truncate">{file.name}</p>
                    {fileError
                      ? <p className="text-xs text-gem-red font-body">{fileError}</p>
                      : <p className="text-xs text-gem-muted font-body">{formatBytes(file.size)} · {file.type === 'application/pdf' ? 'PDF' : 'DOCX'}</p>
                    }
                  </div>
                  {!fileError && <CheckCircle2 size={14} className="text-gem-green-light flex-shrink-0" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(id) }}
                    className="p-1 rounded text-gem-muted hover:text-gem-red transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-gem-red/10 border border-gem-red/25">
              <AlertCircle size={14} className="text-gem-red flex-shrink-0" />
              <p className="text-xs text-gem-red font-body">{error}</p>
            </div>
          )}

          {/* Action */}
          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              icon={Upload}
              iconRight={ChevronRight}
              disabled={!hasValid}
              onClick={startVerification}
            >
              Start AI Verification
            </Button>
            <span className="text-xs text-gem-muted font-body">
              {files.filter(f => !f.error).length} file{files.filter(f => !f.error).length !== 1 ? 's' : ''} ready
            </span>
          </div>
        </>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="glass-card p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-gem-blue/15 border-2 border-gem-blue/30 flex items-center justify-center mx-auto mb-5">
            <Loader2 size={28} className="text-gem-blue-light animate-spin" />
          </div>
          <h3 className="font-display font-semibold text-gem-white text-xl mb-2">Processing…</h3>
          <p className="text-gem-muted font-body text-sm mb-6">{uploadStage}</p>

          {/* Progress bar */}
          <div className="w-full bg-white/8 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gem-blue to-gem-green rounded-full transition-all duration-500"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gem-muted font-body">{uploadProgress}%</p>

          {uploadProgress === 100 && (
            <div className="mt-5 flex items-center justify-center gap-2 text-gem-green-light">
              <CheckCircle2 size={16} />
              <span className="text-sm font-semibold font-body">Upload complete — launching AI processing</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
