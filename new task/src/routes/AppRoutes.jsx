import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
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
const AddEmployee = lazy(() => import('../pages/admin/AddEmployee'));
const AdminAttendance = lazy(() => import('../pages/admin/AdminAttendance'));
const AdminTasks = lazy(() => import('../pages/TL/AdminTasks'));
const AssignTask = lazy(() => import('../pages/admin/AssignTask'));
const Reports = lazy(() => import('../pages/admin/Reports'));
const Settings = lazy(() => import('../pages/admin/Settings'));

const EmployeeDashboard = lazy(() => import('../pages/employee/EmployeeDashboard'));
const MyAttendance = lazy(() => import('../pages/employee/MyAttendance'));
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

    
        <Route element={<ProtectedRoute role="Admin" />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />
            <Route path="/admin/add-employee" element={<AddEmployee />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/tasks" element={<AdminTasks />} />
            <Route path="/admin/assign-task" element={<AssignTask />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>
        </Route>

   
        <Route element={<ProtectedRoute role="Employee" />}>
          <Route element={<Layout />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/attendance" element={<MyAttendance />} />
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
