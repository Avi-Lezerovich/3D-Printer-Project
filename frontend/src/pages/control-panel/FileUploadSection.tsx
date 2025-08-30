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
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Upload Area */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5" />
        <div className="relative p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <Upload className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">File Upload</h3>
              <p className="text-sm text-slate-400">Upload 3D models and G-code files</p>
            </div>
          </div>

          {/* Enhanced Drag & Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-500 ${
              isDragOver 
                ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 shadow-lg shadow-cyan-500/20' 
                : 'border-white/20 hover:border-white/30 hover:bg-white/5'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: isDragOver ? 1.1 : 1,
                  rotate: isDragOver ? 5 : 0,
                  y: isDragOver ? -10 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mb-6"
              >
                <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center transition-all duration-300 ${
                  isDragOver 
                    ? 'bg-cyan-500/20 border-2 border-cyan-400/50' 
                    : 'bg-white/10 border-2 border-white/20'
                }`}>
                  <Upload className={`w-12 h-12 transition-colors ${isDragOver ? 'text-cyan-400' : 'text-slate-400'}`} />
                </div>
              </motion.div>
              
              <h4 className="text-2xl font-bold text-white mb-2">
                {isDragOver ? 'Drop files here!' : 'Upload Your Files'}
              </h4>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {isDragOver 
                  ? 'Release to upload your files' 
                  : 'Drag & drop files here, or click browse. Supports .gcode, .stl, and .3mf files up to 100MB'
                }
              </p>
              
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl text-cyan-300 font-semibold hover:border-cyan-400/50 transition-all flex items-center space-x-3 mx-auto"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Folder className="w-5 h-5" />
                <span>Browse Files</span>
              </motion.button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".gcode,.stl,.3mf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Enhanced Upload Progress */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="w-8 h-8 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="text-lg font-semibold text-white">Uploading...</span>
                    </div>
                    <span className="text-lg font-bold text-cyan-400">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Storage Overview */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
        <div className="relative p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <HardDrive className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Storage Overview</h4>
              <p className="text-sm text-slate-400">Monitor your storage usage</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Cloud className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">2.4 GB</div>
                  <div className="text-xs text-slate-400">Cloud Storage</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Used: 0.6 GB</span>
                  <span className="text-green-400">75% free</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "25%" }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <HardDrive className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">156 MB</div>
                  <div className="text-xs text-slate-400">Local Storage</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Used: 86 MB</span>
                  <span className="text-yellow-400">45% free</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "55%" }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <FileText className="w-8 h-8 text-orange-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">47</div>
                  <div className="text-xs text-slate-400">Total Files</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Recent: 12</span>
                  <span className="text-blue-400">Active</span>
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-2 flex-1 bg-orange-500/30 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Recent Uploads */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                <RotateCcw className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Recent Uploads</h4>
                <p className="text-sm text-slate-400">Your latest uploaded files</p>
              </div>
            </div>
            <motion.button 
              className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium hover:border-green-400/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All
            </motion.button>
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 p-4 rounded-2xl bg-white/10 border border-white/20">
                  <FileText className="w-12 h-12 mx-auto text-slate-400" />
                </div>
                <p className="text-lg font-semibold text-white mb-2">No recent uploads</p>
                <p className="text-sm text-slate-400">Upload files to see them appear here</p>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              <AnimatePresence>
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative overflow-hidden rounded-2xl p-4 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${
                          file.status === 'success' 
                            ? 'bg-green-500/20 border border-green-500/30' 
                            : 'bg-red-500/20 border border-red-500/30'
                        }`}>
                          {file.status === 'success' ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <X className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <h5 className="text-lg font-semibold text-white">{file.name}</h5>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span className="flex items-center space-x-1">
                              <HardDrive className="w-3 h-3" />
                              <span>{file.size}</span>
                            </span>
                            <span>{file.uploadedAt.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button 
                          className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:border-blue-400/50 transition-all"
                          title="Download"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                        <motion.button 
                          onClick={() => removeFile(file.id)}
                          className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:border-red-400/50 transition-all"
                          title="Remove"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Enhanced File Management Actions */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5" />
        <div className="relative p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
              <Folder className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">File Management</h4>
              <p className="text-sm text-slate-400">Organize and maintain your files</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button 
              className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl transition-all flex flex-col items-center space-y-3"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Cloud className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Sync Cloud</p>
                <p className="text-xs text-slate-400">Backup files</p>
              </div>
            </motion.button>

            <motion.button 
              className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 hover:border-green-400/50 rounded-2xl transition-all flex flex-col items-center space-y-3"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Download className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Export All</p>
                <p className="text-xs text-slate-400">Download files</p>
              </div>
            </motion.button>

            <motion.button 
              className="p-6 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 hover:border-red-400/50 rounded-2xl transition-all flex flex-col items-center space-y-3"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Clear Cache</p>
                <p className="text-xs text-slate-400">Free up space</p>
              </div>
            </motion.button>

            <motion.button 
              className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 hover:border-orange-400/50 rounded-2xl transition-all flex flex-col items-center space-y-3"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Check Files</p>
                <p className="text-xs text-slate-400">Verify integrity</p>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FileUploadSection;
