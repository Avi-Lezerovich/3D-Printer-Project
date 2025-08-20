import React from 'react'

export const AttachmentUploader: React.FC = () => {
  return (
    <div>
      <input type="file" disabled aria-disabled />
      <small style={{ display: 'block', fontSize: 10, opacity: 0.6 }}>Attachments coming soon…</small>
    </div>
  )
}
