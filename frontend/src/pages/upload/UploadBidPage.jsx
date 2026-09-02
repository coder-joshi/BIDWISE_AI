import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, FileText, X, CheckCircle2, AlertCircle, Loader2,
  Cloud, FileType, ChevronRight, Info
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_SIZE_MB = 25

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadBidPage() {
  const navigate = useNavigate()
  const { setProcessingState } = useUIStore()
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
      const typeOk = ACCEPTED_TYPES.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx')
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
    setProcessingState('processing')
    
    setUploadProgress(20)
    setUploadStage('Authenticating and uploading payload...')

    // Call python backend to initiate upload
    try {
      const formData = new FormData();
      formData.append('file', validFiles[0].file); // Backend expects one file right now
      
      const response = await fetch('http://localhost:8000/api/v1/bids/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      setUploadProgress(60);
      setUploadStage('Queuing documents for OCR extraction...');
      await new Promise(r => setTimeout(r, 800));
      
      setUploadProgress(100);
      setUploadStage('Upload complete!');
      await new Promise(r => setTimeout(r, 600));

      navigate('/processing', { state: { taskId: data.task_id, uploadedFiles: validFiles.map(f => f.file.name) } })
    } catch (err) {
      setError('Upload failed. Please try again.');
      setUploading(false);
    }
  }

  const hasValid = files.some((f) => !f.error)

  return (
    <div className="animate-fade-in w-full space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight m-0">Upload Bid Package</h1>
        <p className="text-gray-600 font-body text-sm mt-1 m-0">
          Securely upload and encrypt bid documents for AI-powered compliance verification.
        </p>
      </div>

      {/* Tender context */}
      <div className="bg-[#f8f9fa] border border-gray-200 rounded p-5 flex flex-wrap gap-8 items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-white border border-gray-300 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-[#003c8f]" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-body uppercase tracking-wider mb-0.5">Active Tender</p>
            <p className="text-sm font-bold text-gray-900 font-mono m-0">GeM/2026/TENDER/005821</p>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-body uppercase tracking-wider mb-0.5">Tender Title</p>
          <p className="text-sm font-bold text-gray-900 font-body truncate m-0">Supply and Installation of Solar Panels (500KW) for Central Secretariat</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-body uppercase tracking-wider mb-0.5">Deadline</p>
          <p className="text-sm font-bold text-gray-900 font-body m-0">Oct 15, 2026 - 15:00 IST</p>
        </div>
      </div>

      {/* Drop zone */}
      {!uploading && (
        <div>
          <div
            className={`relative border-2 border-dashed rounded bg-[#f8f9fa] p-12 text-center transition-all duration-200 cursor-pointer ${
              dragActive
                ? 'border-[#003c8f] bg-[#e3f2fd]'
                : 'border-gray-300 hover:border-[#003c8f] hover:bg-white'
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

            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${
              dragActive ? 'bg-[#003c8f] text-white' : 'bg-white border border-gray-300 text-[#003c8f]'
            }`}>
              <Cloud size={28} />
            </div>

            <h3 className="font-display font-bold text-gray-900 text-lg mb-1">
              {dragActive ? 'Drop files to upload' : 'Drag & drop bid documents'}
            </h3>
            <p className="text-gray-500 font-body text-sm mb-3">
              or <span className="text-[#003c8f] underline hover:text-[#002b66] transition-colors">browse to select files</span>
            </p>
            <p className="text-xs text-gray-400 font-body uppercase tracking-wider">
              PDF · DOCX · Max {MAX_SIZE_MB}MB per file
            </p>
          </div>

          {/* What to upload hint */}
          <div className="mt-4 flex items-start gap-3 p-3 rounded bg-[#fff3cd] border border-[#ffeeba]">
            <Info size={18} className="text-[#856404] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#856404] font-body leading-relaxed m-0">
              <strong>Required Documents:</strong> GST Certificate, PAN card, Udyam Certificate, ISO Certificate, Experience Certificates, Bank Solvency Letter, OEM Authorization.
            </p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-xs font-bold text-gray-500 font-body uppercase tracking-wider mb-2">
                Selected Files ({files.length})
              </p>
              <div>
                {files.map(({ id, file, error: fileError }) => (
                  <div
                    key={id}
                    className={`flex items-center gap-4 p-3 mb-2 rounded border transition-colors ${
                      fileError
                        ? 'bg-[#f8d7da] border-[#f5c6cb]'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                      fileError ? 'bg-[#f5c6cb]' : 'bg-gray-100'
                    }`}>
                      <FileType size={18} className={fileError ? 'text-[#721c24]' : 'text-gray-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold font-body truncate m-0 ${fileError ? 'text-[#721c24]' : 'text-gray-900'}`}>{file.name}</p>
                      {fileError
                        ? <p className="text-xs text-[#721c24] font-body m-0 mt-0.5">{fileError}</p>
                        : <p className="text-xs text-gray-500 font-body m-0 mt-0.5">{formatBytes(file.size)} · {file.type === 'application/pdf' || file.name.endsWith('.pdf') ? 'PDF Document' : 'Word Document'}</p>
                      }
                    </div>
                    {!fileError && <CheckCircle2 size={16} className="text-[#138808] flex-shrink-0" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(id) }}
                      className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0 ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded bg-[#f8d7da] border border-[#f5c6cb]">
              <AlertCircle size={16} className="text-[#721c24] flex-shrink-0" />
              <p className="text-sm text-[#721c24] font-bold m-0">{error}</p>
            </div>
          )}

          {/* Action */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-4">
            <button
              disabled={!hasValid}
              onClick={startVerification}
              className="bg-[#003c8f] hover:bg-[#002b66] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded font-bold flex items-center gap-2 transition-colors"
            >
              <Upload size={18} /> Start AI Verification <ChevronRight size={18} />
            </button>
            <span className="text-sm text-gray-500 font-body">
              {files.filter(f => !f.error).length} file{files.filter(f => !f.error).length !== 1 ? 's' : ''} ready
            </span>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="bg-white border border-gray-200 rounded p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-6">
            <Loader2 size={32} className="text-[#003c8f] animate-spin" />
          </div>
          <h3 className="font-display font-bold text-gray-900 text-xl mb-2 tracking-tight">Processing Documents</h3>
          <p className="text-gray-500 font-body text-sm mb-6 h-5">{uploadStage}</p>

          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="h-full bg-[#003c8f] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 font-body font-mono">{uploadProgress}% Complete</p>

          {uploadProgress === 100 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-[#138808]">
              <CheckCircle2 size={18} />
              <span className="text-sm font-bold font-body">Upload successful! Redirecting...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
