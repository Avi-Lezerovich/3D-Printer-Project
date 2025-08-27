import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../shared/store';
import { 
  Upload, FileText, Check, X, AlertCircle, Folder, 
  Cloud, HardDrive, RotateCcw, Download, Trash2
} from 'lucide-react';

const FileUploadSection = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{id: string, name: string, size: string, status: 'success' | 'error', uploadedAt: Date}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addJob } = useAppStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => 
      file.name.toLowerCase().endsWith('.gcode') || 
      file.name.toLowerCase().endsWith('.stl') ||
      file.name.toLowerCase().endsWith('.3mf')
    );

    if (validFiles.length === 0) {
      console.info('Invalid file types. Accepts: .gcode, .stl, .3mf');
      return;
    }

    for (const file of validFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<void> => {
    const fileId = Math.random().toString(36).substr(2, 9);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add to uploaded files list
          setUploadedFiles(prev => [...prev, {
            id: fileId,
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            status: 'success',
            uploadedAt: new Date()
          }]);
          
          // Add to print queue
          addJob({
            id: fileId,
            name: file.name,
            status: 'queued',
            progress: 0
          });
          
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Upload Area */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-green-400" />
          File Upload
        </h3>

        {/* Drag & Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
            isDragOver 
              ? 'border-blue-400 bg-blue-400/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: isDragOver ? 1.1 : 1,
                rotate: isDragOver ? 5 : 0 
              }}
              transition={{ duration: 0.2 }}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            </motion.div>
            
            <h4 className="text-xl font-semibold text-white mb-2">
              Drop files here or click to browse
            </h4>
            <p className="text-gray-400 mb-4">
              Supports .gcode, .stl, and .3mf files up to 100MB
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="glass-button px-6 py-3 text-sm font-medium"
            >
              <Folder className="w-4 h-4 mr-2" />
              Browse Files
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".gcode,.stl,.3mf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 glass-card"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Uploading...</span>
                <span className="text-sm text-gray-400">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Storage Overview */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h4 className="font-medium text-white mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-purple-400" />
          Storage Overview
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <Cloud className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold text-white">2.4 GB</div>
            <div className="text-xs text-gray-400">Cloud Storage</div>
            <div className="text-xs text-green-400">75% free</div>
          </div>
          <div className="glass-card p-4 text-center">
            <HardDrive className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-white">156 MB</div>
            <div className="text-xs text-gray-400">Local Storage</div>
            <div className="text-xs text-yellow-400">45% free</div>
          </div>
          <div className="glass-card p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <div className="text-2xl font-bold text-white">47</div>
            <div className="text-xs text-gray-400">Total Files</div>
            <div className="text-xs text-blue-400">12 recent</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Uploads */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            Recent Uploads
          </h4>
          <button className="glass-button px-3 py-1 text-xs">
            View All
          </button>
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No recent uploads</p>
            <p className="text-sm">Upload files to see them here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      file.status === 'success' 
                        ? 'bg-green-400/20 text-green-400' 
                        : 'bg-red-400/20 text-red-400'
                    }`}>
                      {file.status === 'success' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-white text-sm">{file.name}</h5>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{file.size}</span>
                        <span>{file.uploadedAt.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      className="glass-button p-2"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="glass-button p-2 hover:bg-red-500/20 hover:border-red-500/30"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* File Management Actions */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h4 className="font-medium text-white mb-4 flex items-center gap-2">
          <Folder className="w-4 h-4 text-yellow-400" />
          File Management
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="glass-button p-4 flex flex-col items-center gap-2">
            <Cloud className="w-6 h-6 text-blue-400" />
            <span className="text-xs">Sync Cloud</span>
          </button>
          <button className="glass-button p-4 flex flex-col items-center gap-2">
            <Download className="w-6 h-6 text-green-400" />
            <span className="text-xs">Export All</span>
          </button>
          <button className="glass-button p-4 flex flex-col items-center gap-2">
            <Trash2 className="w-6 h-6 text-red-400" />
            <span className="text-xs">Clear Cache</span>
          </button>
          <button className="glass-button p-4 flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-400" />
            <span className="text-xs">Check Files</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FileUploadSection;
