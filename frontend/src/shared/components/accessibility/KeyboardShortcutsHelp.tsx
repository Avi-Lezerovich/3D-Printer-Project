import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';
import { useAnimations } from '../../hooks/useAnimations';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

export default function KeyboardShortcutsHelp({ 
  isOpen, 
  onClose, 
  shortcuts 
}: KeyboardShortcutsHelpProps) {
  const { scaleIn, fadeIn } = useAnimations();

  const formatKey = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.metaKey) keys.push('Cmd');
    keys.push(shortcut.key.toUpperCase());
    return keys;
  };

  const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
    const category = shortcut.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
    return groups;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            {...fadeIn}
            className="fixed inset-0 bg-black bg-opacity-50 z-[1000]"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            {...scaleIn}
            className="fixed inset-0 z-[1001] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              className="panel max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-sm">
                  <Keyboard size={24} className="text-var(--accent)" />
                  <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-sm rounded-lg hover:bg-var(--border) transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-lg">
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="text-lg font-medium mb-md text-var(--text-soft)">
                      {category}
                    </h3>
                    <div className="space-y-sm">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div 
                          key={`${category}-${index}`}
                          className="flex items-center justify-between py-sm px-md rounded-lg bg-var(--bg) border border-var(--border)"
                        >
                          <span className="text-var(--text-secondary)">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-xs">
                            {formatKey(shortcut).map((key, keyIndex) => (
                              <kbd 
                                key={keyIndex}
                                className="px-sm py-xs text-xs font-mono rounded border border-var(--border) bg-var(--panel) text-var(--text)"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-lg pt-lg border-t border-var(--border)">
                <p className="text-sm text-var(--text-secondary) text-center">
                  Press <kbd className="px-sm py-xs text-xs font-mono rounded border border-var(--border) bg-var(--panel)">?</kbd> to show this help again
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}