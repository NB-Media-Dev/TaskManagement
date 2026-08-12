import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  BarChart3,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { classNames } from '../../utils/helpers';
import  Avatar  from '../ui/Avatar';

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/employees', icon: Users, label: 'Employees' },
  // { to: '/admin/attendance', icon: Calendar, label: 'Attendance' },
  // { to: '/admin/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const tlNav = [
  { to: '/TL', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/TL/assign-task', icon: CheckSquare, label: 'Assign Task' },
  { to: '/TL/AdminTasks', icon: ClipboardList, label: 'Team Tasks' },
  { to: '/TL/profile', icon: User, label: 'Profile' },
];

const employeeNav = [
  { to: '/employee', icon: LayoutDashboard, label: 'Dashboard' },
  // { to: '/employee/attendance', icon: Calendar, label: 'My Attendance' },
  { to: '/employee/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/employee/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isTL = user?.role === 'TL';
  const navItems = isAdmin ? adminNav : isTL ? tlNav : employeeNav;

  const handleKeyDown =(e)=>{
    if(e.key === 'Escape' || e.key === ' ' || e.key === 'Enter'){
      e.preventDefault();
      onMobileClose();
    }
  };
  return (
    <>
      {mobileOpen && (
       <button
          type="button"
          className="sidebar-backdrop"
          onClick={onMobileClose}
          onKeyDown={handleKeyDown}
          aria-label="Close navigation overlay menu"
          title="Close menu overlay"
        />
      )}

      <aside
        className={classNames(
          'sidebar-aside',
          collapsed && 'collapsed',
          mobileOpen && 'mobile-open'
        )}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="sidebar-brand-title">
                Task Management
              </span>
            )}
          </div>
          <button
          type="button"
            onClick={onToggle}
            className="sidebar-toggle-btn"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={classNames('sidebar-toggle-icon', collapsed && 'rotated')} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/employee' || item.to === '/TL'}
              onClick={onMobileClose}
              className={({ isActive }) =>
                classNames(
                  'sidebar-nav-item',
                  isActive && 'active'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="sidebar-active-indicator"
                    />
                  )}
                  <item.icon className="sidebar-nav-icon" />
                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className={classNames('sidebar-user-card', collapsed && 'centered')}>
            <Avatar 
              name={user?.name || (isAdmin ? 'Admin User' : 'Employee Staff')} 
              size="sm" 
              className="text-xs font-bold"
            />
            {!collapsed && (
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">
                  {user?.name || (isAdmin ? 'Admin' : 'Employee')}
                </p>
                <p className="sidebar-user-email">{user?.email || ''}</p>
              </div>
            )}
          </div>
          <button
          type="button"
            onClick={logout}
            className={classNames(
              'sidebar-logout-btn',
              collapsed && 'centered'
            )}
          >
            <LogOut className="sidebar-nav-icon" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

