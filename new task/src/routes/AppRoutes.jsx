import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import { TableSkeleton } from '../components/ui';

const Login = lazy(() => import('../pages/Login'));
const CreateAccount = lazy(() => import('../pages/CreateAccount'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ErrorPage = lazy(() => import('../pages/ErrorPage'));
const Profile = lazy(() => import('../pages/Profile'));

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminEmployees = lazy(() => import('../pages/admin/AdminEmployees'));

const AdminTasks = lazy(() => import('../pages/TL/AdminTasks'));
const Reports = lazy(() => import('../pages/admin/Reports'));
const Settings = lazy(() => import('../pages/admin/Settings'));

const AdminEmployee = lazy(() => import('../pages/admin2/AdminEmployee'));
const AddEmployees = lazy(() => import('../pages/admin2/AddEmployees'));
const Setting = lazy(() => import('../pages/admin2/Setting'));

const EmployeeDashboard = lazy(() => import('../pages/employee/EmployeeDashboard'));
const MyTasks = lazy(() => import('../pages/employee/MyTasks'));

const TLDashboard = lazy(() => import('../pages/TL/TlDashboard'));
const TLAssignTask = lazy(() => import('../pages/TL/AssignTask'));
const TLAdminTasks = lazy(() => import('../pages/TL/AdminTasks'));
const TLReviewTask = lazy(() => import('../pages/TL/ReviewTask'));

function PageFallback() {
  return (
    <div className="p-6">
      <TableSkeleton rows={4} cols={4} />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
       
        <Route path="/" element={<Login />} />
        <Route path="/create" element={<CreateAccount />} />
        <Route path="/forget" element={<ForgotPassword />} />

    
        <Route element={<ProtectedRoute role="Cto" />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />
            <Route path="/admin/reports" element={<Reports />} />
            {/* <Route path="/admin/settings" element={<Settings />} /> */}
            <Route path="/admin/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="Admin" />}>
          <Route element={<Layout />}>
            <Route path="/admin2" element={<Navigate to="/admin2/employees" replace />} />
            <Route path="/admin2/employees" element={<AdminEmployee />} />
            <Route path="/admin2/add-employee" element={<AddEmployees />} />
            {/* <Route path="/admin2/setting" element={<Setting />} /> */}
            <Route path="/admin2/profile" element={<Profile />} />
          </Route>
        </Route>
   
        <Route element={<ProtectedRoute role="Employee" />}>
          <Route element={<Layout />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/tasks" element={<MyTasks />} />
            <Route path="/employee/profile" element={<Profile />} />
          </Route>
        </Route>

         <Route element={<ProtectedRoute role="TL" />}>
          <Route element={<Layout />}>
            <Route path="/TL" element={<TLDashboard />} />
            <Route path="/TL/assign-task" element={<TLAssignTask />} />
            <Route path="/TL/AdminTasks" element={<TLAdminTasks />} />
            <Route path="/TL/review-task/:id" element={<TLReviewTask />} />
            <Route path="/TL/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
}
