import React from 'react'

type ModalProps = {
  open: boolean
  title?: string
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  children?: React.ReactNode
}

export default function Modal({ open, title, onClose, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', children }: ModalProps){
  if(!open) return null
  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'grid', placeItems:'center', zIndex:1000}}>
      <div className="panel" style={{width:'min(520px, 92vw)', boxShadow:'0 10px 30px rgba(0,0,0,.3)'}}>
        {title && <h2 style={{marginBottom:8}}>{title}</h2>}
        <div style={{marginTop:8}}>{children}</div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:16}}>
          <button className="btn" onClick={onClose}>{cancelText}</button>
          {onConfirm && <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>}
        </div>
      </div>
    </div>
  )
}
