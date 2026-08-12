import { Modal, Button, Input, Select } from '../../components/ui';
import { ROLE_OPTIONS } from '../../utils/helpers';

export default function EditEmployeeModal({
  open,
  onClose,
  name,
  email,
  phone,
  gender,
  salary,
  role,
  position,
  password,
  setName,
  setEmail,
  setPhone,
  setGender,
  setSalary,
  setRole,
  setPosition,
  setPassword,
  onSave,
  saving,
}) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Employee & Change Password" size="md">
      <div className="employee-form-grid">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {/* <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Select
          label="Gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          options={GENDER_OPTIONS}
          placeholder="Select gender"
        /> */}
        {/* <Input label="Salary" type="number" value={salary} onChange={(e) => setSalary(e.target.value)} /> */}
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={ROLE_OPTIONS}
          placeholder="Select role"
        />
        <Select
          label="Position"
          value={position}
          onChange={(e) => setPosition && setPosition(e.target.value)}
          options={[
            { value: 'Employee', label: 'Employee' },
            { value: 'TL', label: 'TL (Team Leader)' },
          ]}
          placeholder="Select position"
        />
       <div style={{ gridColumn: '1/-1' }}>
          <Input
            label="Employee Password (Admin Reset)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password (leave empty to keep current)"
          />
        </div>
      </div>

      <div className="modal-footer">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSave} loading={saving}>
          Update Employee 
        </Button>
      </div>
    </Modal>
  );
}
