import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../shared/store';

const FileUploadSection = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
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
      file.name.toLowerCase().endsWith('.stl')
    );

    if (validFiles.length === 0) {
      alert('Please select valid .gcode or .stl files');
      return;
    }

    for (const file of validFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<void> => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add to queue
          addJob({
            id: Date.now().toString(),
            name: file.name,
            progress: 0,
            status: 'queued'
          });
          
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="panel file-upload-section">
      <div className="upload-header">
        <h2>📁 File Management</h2>
        <div className="file-stats">
          <span className="supported-formats">G-code, STL</span>
        </div>
      </div>

      <motion.div
        className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={isDragOver ? { scale: 1.02 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".gcode,.stl"
          onChange={handleFileSelect}
          className="file-input-hidden"
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              className="upload-status"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="upload-icon uploading">📤</div>
              <div className="upload-text">
                <h3>Uploading File...</h3>
                <p>{uploadProgress}% complete</p>
              </div>
              <div className="upload-progress">
                <div 
                  className="upload-progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </motion.div>
          ) : isDragOver ? (
            <motion.div
              key="drop"
              className="upload-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="upload-icon drop">🎯</div>
              <div className="upload-text">
                <h3>Drop files here</h3>
                <p>Release to upload</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              className="upload-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <h3>Upload Print Files</h3>
                <p>Drag & drop files here or click to browse</p>
              </div>
              <motion.button
                className="btn btn-primary upload-button"
                onClick={openFileDialog}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📂 Choose Files
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="recent-files">
        <h3>📋 Recent Files</h3>
        <div className="file-list">
          <div className="file-item">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <div className="file-name">calibration_cube.gcode</div>
              <div className="file-details">2.3 MB • 1h 23m</div>
            </div>
            <button className="btn btn-small btn-secondary">🖨️</button>
          </div>
          <div className="file-item">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <div className="file-name">miniature_dragon.gcode</div>
              <div className="file-details">5.7 MB • 3h 45m</div>
            </div>
            <button className="btn btn-small btn-secondary">🖨️</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FileUploadSection;
