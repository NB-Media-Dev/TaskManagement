import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="confirm-dialog-content">
        <div className="confirm-dialog-icon-badge">
          <AlertTriangle className="confirm-dialog-icon" />
        </div>
        <div className="flex-1">
          <h3 className="modal-title">{title}</h3>
          {message && <p className="text-sm text-ink/60 mt-1">{message}</p>}
        </div>
      </div>
      <div className="modal-footer">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

