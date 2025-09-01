import React, { useCallback, useEffect, useRef } from 'react'
import { ACCESSIBILITY } from '../../../utils/constants'

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
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement
      const focusableAll = dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (focusableAll && focusableAll.length) {
        // Skip focus guards by selecting first visible & not offscreen
        const target = Array.from(focusableAll).find(el => !el.getAttribute('data-focus-guard'))
        target?.focus()
      }
    } else if (!open && previouslyFocused.current) {
      previouslyFocused.current.focus()
    }
  }, [open])

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => onKeyDown(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onKeyDown])

  if(!open) return null
  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'grid', placeItems:'center', zIndex:1000}}>
      <div ref={dialogRef} className="panel" style={{width:'min(520px, 92vw)', boxShadow:'0 10px 30px rgba(0,0,0,.3)'}}>
        <span tabIndex={0} {...{[ACCESSIBILITY.FOCUS_GUARD_ATTR]: 'start'}} style={{position:'fixed', left:-9999, top:'auto'}} />
        {title && <h2 style={{marginBottom:8}} id="dialog-title">{title}</h2>}
        <div style={{marginTop:8}}>{children}</div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:16}}>
          <button className="btn" onClick={onClose}>{cancelText}</button>
          {onConfirm && <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>}
        </div>
        <span tabIndex={0} {...{[ACCESSIBILITY.FOCUS_GUARD_ATTR]: 'end'}} style={{position:'fixed', left:-9999, top:'auto'}} />
      </div>
    </div>
  )
}
