import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  User,
  // Settings,
  LogOut,
  ChevronLeft,
  ClipboardList,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { classNames } from '../../utils/helpers';
import  Avatar  from '../ui/Avatar';

const ctoNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/employees', icon: Users, label: 'Employees' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  // { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/profile', icon: User, label: 'Profile' },
];

const adminNav = [
  { to: '/admin2/employees', icon: Users, label: 'Employees' },
  // { to: '/admin2/setting', icon: Settings, label: 'Settings' },
  { to: '/admin2/profile', icon: User, label: 'Profile' },
];

const tlNav = [
  { to: '/TL', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/TL/assign-task', icon: CheckSquare, label: 'Assign Task' },
  { to: '/TL/AdminTasks', icon: ClipboardList, label: 'Team Tasks' },
  { to: '/TL/profile', icon: User, label: 'Profile' },
];

const employeeNav = [
  { to: '/employee', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employee/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/employee/profile', icon: User, label: 'Profile' },
];

function SidebarLinks({ items, collapsed, mobileOpen, onMobileClose }) {
  return (
    <nav className="sidebar-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/admin' || item.to === '/admin2' || item.to === '/employee' || item.to === '/TL'}
          onClick={onMobileClose}
          className={({ isActive }) =>
            classNames('sidebar-nav-item', isActive && 'active')
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
              {(!collapsed || mobileOpen) && <span className="whitespace-nowrap">{item.label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function getDefaultRoleInfo(role) {
  if (role === 'Admin') {
    return { avatarName: 'Admin User', displayName: 'Admin', navItems: adminNav };
  }
  if (role === 'Cto') {
    return { avatarName: 'Cto User', displayName: 'Cto', navItems: ctoNav };
  }
  if (role === 'TL') {
    return { avatarName: 'Team Lead', displayName: 'Team Lead', navItems: tlNav };
  }
  return { avatarName: 'Employee Staff', displayName: 'Employee', navItems: employeeNav };
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const { avatarName: defaultAvatarName, displayName: defaultDisplayName, navItems } = getDefaultRoleInfo(user?.role);

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
            {(!collapsed || mobileOpen) && (
              <span className="sidebar-brand-title">
                Task Management
              </span>
            )}
          </div>
          <div className="sidebar-header-actions">
            {mobileOpen ? (
              <button
                type="button"
                onClick={onMobileClose}
                className="sidebar-toggle-btn sidebar-mobile-close-btn"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onToggle}
                className="sidebar-toggle-btn"
                aria-label="Toggle sidebar"
              >
                <ChevronLeft className={classNames('sidebar-toggle-icon', collapsed && 'rotated')} />
              </button>
            )}
          </div>
        </div>    
        <SidebarLinks 
          items={navItems} 
          collapsed={collapsed} 
          mobileOpen={mobileOpen} 
          onMobileClose={onMobileClose} 
        />
 
        <div className="sidebar-footer">
          <div className={classNames('sidebar-user-card', (collapsed && !mobileOpen) && 'centered')}>
            <Avatar 
              name={user?.name || defaultAvatarName} 
              size="sm" 
              className="text-xs font-bold"
            />
            {(!collapsed || mobileOpen) && (
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">
                  {user?.name || defaultDisplayName}
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
              (collapsed && !mobileOpen) && 'centered'
            )}
          >
            <LogOut className="sidebar-nav-icon" />
            {(!collapsed || mobileOpen) && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

