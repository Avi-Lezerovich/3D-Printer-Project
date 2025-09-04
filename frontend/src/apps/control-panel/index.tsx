import React, { useState } from 'react'
import '../../styles/control-panel.css'

interface PrinterStatus {
  isConnected: boolean
  temperature: {
    hotend: { current: number; target: number }
    bed: { current: number; target: number }
  }
  progress: number
  status: 'idle' | 'printing' | 'paused' | 'error'
  printTime: string
}

const ControlPanelApp: React.FC = () => {
  const [printerStatus] = useState<PrinterStatus>({
    isConnected: true,
    temperature: {
      hotend: { current: 195, target: 200 },
      bed: { current: 58, target: 60 }
    },
    progress: 67,
    status: 'printing',
    printTime: '2:45:32'
  })

  const getStatusIndicatorClass = () => {
    if (!printerStatus.isConnected) return 'status-indicator offline'
    if (printerStatus.status === 'error') return 'status-indicator warning'
    return 'status-indicator online'
  }

  const getStatusText = () => {
    if (!printerStatus.isConnected) return 'Disconnected'
    return printerStatus.status.charAt(0).toUpperCase() + printerStatus.status.slice(1)
  }

  return (
    <div className="control-panel-layout">
      <div className="control-panel-grid">
        {/* Status Overview */}
        <section className="status-overview panel">
          <h2 className="panel-title">Printer Status</h2>
          <div className="status-cards">
            <div className="status-card">
              <div className={getStatusIndicatorClass()}>
                <span>{getStatusText()}</span>
              </div>
            </div>
            
            <div className="status-card">
              <h3>Temperature</h3>
              <div className="temp-display">
                <div className="temp-item">
                  <span className="temp-label">Hotend</span>
                  <span className="temp-value">{printerStatus.temperature.hotend.current}°C / {printerStatus.temperature.hotend.target}°C</span>
                </div>
                <div className="temp-item">
                  <span className="temp-label">Bed</span>
                  <span className="temp-value">{printerStatus.temperature.bed.current}°C / {printerStatus.temperature.bed.target}°C</span>
                </div>
              </div>
            </div>

            <div className="status-card">
              <h3>Print Progress</h3>
              <div className="progress-display">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${printerStatus.progress}%` }}
                  />
                </div>
                <span className="progress-text">{printerStatus.progress}%</span>
                <span className="time-remaining">Time: {printerStatus.printTime}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Printer Controls */}
        <section className="printer-controls panel">
          <h2 className="panel-title">Controls</h2>
          <div className="action-buttons">
            <button className="btn btn-success">
              <span>Start Print</span>
            </button>
            <button className="btn btn-warning">
              <span>Pause</span>
            </button>
            <button className="btn btn-danger">
              <span>Emergency Stop</span>
            </button>
          </div>
          
          <div className="temperature-controls">
            <div className="temp-control">
              <label>Hotend Target</label>
              <input type="number" value={printerStatus.temperature.hotend.target} className="temp-input" />
            </div>
            <div className="temp-control">
              <label>Bed Target</label>
              <input type="number" value={printerStatus.temperature.bed.target} className="temp-input" />
            </div>
          </div>
        </section>

        {/* Webcam Feed */}
        <section className="webcam-feed panel">
          <h2 className="panel-title">
            Live Camera Feed
            <span className="live-indicator">
              <span className="live-dot"></span>
              LIVE
            </span>
          </h2>
          <div className="webcam-viewport">
            <div className="webcam-placeholder">
              <p>Camera feed will appear here</p>
            </div>
          </div>
        </section>

        {/* File Management */}
        <section className="file-management panel">
          <h2 className="panel-title">File Management</h2>
          <div className="file-upload-area">
            <p>Drop files here or click to upload</p>
            <button className="btn btn-primary">
              <span>Browse Files</span>
            </button>
          </div>
        </section>

        {/* Print Queue */}
        <section className="print-queue panel">
          <h2 className="panel-title">Print Queue</h2>
          <div className="queue-list">
            <div className="queue-item active">
              <span className="filename">test_print.gcode</span>
              <span className="file-size">2.4 MB</span>
              <span className="status-indicator online">Printing</span>
            </div>
            <div className="queue-item">
              <span className="filename">miniature.gcode</span>
              <span className="file-size">1.8 MB</span>
              <span className="status-indicator">Queued</span>
            </div>
          </div>
        </section>

        {/* Temperature Monitoring Chart Placeholder */}
        <section className="temperature-monitoring panel">
          <h2 className="panel-title">Temperature Chart</h2>
          <div className="chart-placeholder">
            <p>Temperature monitoring chart will be implemented here</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ControlPanelApp
