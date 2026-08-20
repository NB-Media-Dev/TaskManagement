import { Modal } from '../../components/ui';
import { AddEmployeeForm } from './AddEmployees';

export default function AddEmployeeModals({ open, onClose, onSuccess }) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Add New Employee" size="md">
      <AddEmployeeForm isModal onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}
