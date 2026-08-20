// import { useState } from 'react';
// import { Lock } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { useToast } from '../../context/ToastContext';
// import { Card, Input, PasswordChangeFormSection } from '../../components/ui';
// import { changePassword as apiChangePassword } from '../../services';
// import { executePasswordChange } from '../../utils/helpers';

// export default function Setting() {
//   const { user } = useAuth();
//   const toast = useToast();

//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const handleChangePassword = (e) => {
//     e.preventDefault();
//     executePasswordChange({
//       email: user?.email,
//       newPassword,
//       confirmPassword,
//       toast,
//       setSubmitting,
//       apiChangePassword,
//       onSuccess: () => {
//         setNewPassword('');
//         setConfirmPassword('');
//       },
//     });
//   };

//   return (
//     <div className="settings-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '48rem' }}>
//       <div>
//         <h1 className="dashboard-header-title">Admin Settings</h1>
//         <p className="dashboard-header-sub">Manage your account and change password.</p>
//       </div>

//       <Card className="ui-card-p6">
//         <h3 className="dashboard-card-title" style={{ marginBottom: '0.25rem' }}>Account Details</h3>
//         <p className="dashboard-header-sub" style={{ marginBottom: '1rem' }}>Signed in as {user?.email}</p>
//         <div className="employee-form-grid">
//           <Input label="Email address" value={user?.email || ''} disabled />
//           <Input label="Role" value={user?.role || ''} disabled />
//         </div>
//       </Card>

//       <Card className="ui-card-p6">
//         <div className="reports-header-icon" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
//           <Lock className="w-5 h-5 text-primary" />
//           <h3 className="dashboard-card-title" style={{ margin: 0 }}>Change Password</h3>
//         </div>

//         <PasswordChangeFormSection
//           newPassword={newPassword}
//           setNewPassword={setNewPassword}
//           confirmPassword={confirmPassword}
//           setConfirmPassword={setConfirmPassword}
//           onSubmit={handleChangePassword}
//           submitting={submitting}
//         />
//       </Card>
//     </div>
//   );
// }
