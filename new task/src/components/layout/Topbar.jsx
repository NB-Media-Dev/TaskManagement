import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  ChevronDown, 
  Menu, 
  User, 
  LogOut, 
  UserPlus,
  ClipboardList,
  Edit3,
  MessageSquare,
  CheckCheck,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../services";
import NotificationPopupContainer from './NotificationPopupContainer';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/employees': 'Employee Management',
  '/admin/add-employee': 'Add Employee',
  '/admin/attendance': 'Attendance Records',
  '/admin/tasks': 'Task Management',
  '/admin/assign-task': 'Assign Task',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
  '/admin/profile': 'My Profile',
  '/employee': 'Dashboard',
  '/employee/attendance': 'My Attendance',
  '/employee/tasks': 'My Tasks',
  '/employee/profile': 'My Profile',
  '/TL': 'TL Dashboard',
  '/TL/assign-task': 'Assign Task',
  '/TL/AdminTasks': 'Daily Tasks',
  '/TL/profile': 'My Profile',
};

const getPoppedIdsSet = (email) => {
  try {
    const key = `popped_notifs_${email || 'default'}`;
    const data = sessionStorage.getItem(key);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch (e) {
    console.warn('Failed to parse popped notifications:', e);
    return new Set();
  }
};

const savePoppedIdsSet = (email, setObj) => {
  try {
    const key = `popped_notifs_${email || 'default'}`;
    sessionStorage.setItem(key, JSON.stringify(Array.from(setObj)));
  } catch (e) {
    console.warn('Failed to save popped notifications:', e);
  }
};

export default function Topbar({ onMobileMenu }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [popups, setPopups] = useState([]);
  const [notifPage, setNotifPage] = useState(1);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const userEmail = user?.email || user?.u_email || '';
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';
  const isAdmin = user?.role === 'Admin';
  const isTL = user?.role === 'TL';
  const isCto = user?.role === 'Cto';

  let profilePath = '/employee/profile';
  if (isAdmin) {
    profilePath = '/admin2/profile';
  } else if (isTL) {
    profilePath = '/TL/profile';
  } else if (isCto) {
    profilePath = '/Admin/profile';
  }

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDismissPopup = (id) => {
    setPopups((prev) => prev.filter((item) => item.id !== id));
  };

  const loadNotifications = async () => {
    try {
      let defaultRoleEmail = user?.name || 'Cto';
      if (user?.role === 'Cto') {
        defaultRoleEmail = 'Cto';
      }

      const emailToUse = userEmail || user?.email || user?.emp_email || user?.u_email || user?.name || defaultRoleEmail;
      const res = await getNotifications(emailToUse);
      if (res.data?.success) {
        let fetchedList = res.data.data || [];
        if (user?.role === 'Admin') {
          fetchedList = fetchedList.filter((n) => {
            const typeStr = String(n.type || '').toUpperCase();
            return !typeStr.includes('TASK');
          });
        }
        setNotifications(fetchedList);

        const poppedSet = getPoppedIdsSet(emailToUse);
        const newPopupsToTrigger = [];

        fetchedList.forEach((n) => {
          if (!n.is_read && !poppedSet.has(n.id)) {
            newPopupsToTrigger.push(n);
            poppedSet.add(n.id);
          }
        });

        if (newPopupsToTrigger.length > 0) {
          savePoppedIdsSet(emailToUse, poppedSet);
          setPopups((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const fresh = newPopupsToTrigger.filter((p) => !existingIds.has(p.id));
            return [...prev, ...fresh].slice(-5);
          });

          newPopupsToTrigger.forEach((p) => {
            setTimeout(() => {
              handleDismissPopup(p.id);
            }, 7000);
          });
        }
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [userEmail]);

  const handleNotificationClick = async (n) => {
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: 1 } : item));
    if (!n.is_read) {
      try {
        await markNotificationRead(n.id);
      } catch (err) {
        console.error('Error marking notification read:', err);
      }
    }
    setNotificationOpen(false);

    const userRole = user?.role || user?.position || user?.emp_role || 'Employee';
    const taskId = n.task_id || n.taskId || n.related_id;
    const typeStr = String(n.type || '').toUpperCase();
    const titleStr = String(n.title || '').toLowerCase();

    if (userRole === 'Cto') {
      navigate('/admin/reports');
    } else if (userRole === 'Admin') {
      navigate('/admin2/employees');
    } else if (userRole === 'TL') {
      if (typeStr.includes('ASSIGN') || titleStr.includes('assign')) {
        navigate('/TL/assign-task');
      } else if (taskId) {
        navigate(`/TL/review-task/${taskId}`);
      } else {
        navigate('/TL/AdminTasks');
      }
    } else {
      // Employee Role
      navigate('/employee/tasks', { state: { highlightTaskId: taskId } });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const emailToUse = userEmail || user?.email || 'Cto';
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      await markAllNotificationsRead(emailToUse);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const notifPageSize = 6;
  const totalNotifPages = Math.ceil(notifications.length / notifPageSize) || 1;
  const paginatedNotifications = notifications.slice(
    (notifPage - 1) * notifPageSize,
    notifPage * notifPageSize
  );

  const getNotifIcon = (type) => {
    switch (type) {
      case 'EMPLOYEE_ADDED':
        return <UserPlus className="w-4 h-4 text-primary" />;
      case 'TASK_ASSIGNED':
        return <ClipboardList className="w-4 h-4 text-success" />;
      case 'TASK_UPDATED_BY_EMPLOYEE':
        return <Edit3 className="w-4 h-4 text-warning" />;
      case 'TASK_UPDATED_BY_TL':
      case 'TASK_REVIEWED_BY_TL':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'TASK_OVERDUE':
      case 'OVERDUE':
        return <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <header className="topbar-header">
      <div className="topbar-left">
        <button
          onClick={onMobileMenu}
          className="topbar-mobile-menu-btn"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="topbar-title">{pageTitle}</h1>
          <nav className="topbar-breadcrumb">
            <span>{user?.role || 'User'}</span>
            <span>/</span>
            <span className="topbar-breadcrumb-current">{pageTitle}</span>
          </nav>
        </div>
      </div>

      <div className="topbar-right">
        {/* <button onClick={toggleTheme} className="topbar-icon-btn" aria-label="Toggle theme">
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button> */}

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setDropdownOpen(false);
            }} 
            className="topbar-icon-btn" 
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="topbar-notif-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="topbar-notif-dropdown"
              >
                <div className="topbar-notif-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="topbar-notif-count-pill">{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="topbar-notif-mark-all-btn">
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="topbar-notif-list">
                  {notifications.length === 0 ? (
                    <div className="topbar-notif-empty">
                      <Bell className="w-8 h-8 text-ink/30" style={{ marginBottom: '0.5rem' }} />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    paginatedNotifications.map((n) => (
                      <button 
                        type="button"
                        key={n.id} 
                        className={`topbar-notif-item ${n.is_read ? 'read' : 'unread'}`}
                        onClick={() => handleNotificationClick(n)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleNotificationClick(n);
                          }
                        }}
                      >
                        <div className="topbar-notif-icon-wrap">
                          {getNotifIcon(n.type)}
                        </div>
                        <div className="topbar-notif-content">
                          <div className="topbar-notif-title-row">
                            <h5 className="topbar-notif-title">{n.title}</h5>
                            <span className="topbar-notif-time">{n.created_at || 'Just now'}</span>
                          </div>
                          <p className="topbar-notif-msg">{n.message}</p>
                        </div>
                        {!n.is_read && (
                          <span className="topbar-notif-unread-dot" title="Unread" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {notifications.length > notifPageSize && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
                    <button
                      onClick={() => setNotifPage((p) => Math.max(p - 1, 1))}
                      disabled={notifPage === 1}
                      className="topbar-notif-mark-all-btn"
                      style={{ opacity: notifPage === 1 ? 0.4 : 1, cursor: notifPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      &laquo; Prev
                    </button>
                    <span style={{ color: 'var(--text-muted)' }}>Page {notifPage} of {totalNotifPages}</span>
                    <button
                      onClick={() => setNotifPage((p) => Math.min(p + 1, totalNotifPages))}
                      disabled={notifPage === totalNotifPages}
                      className="topbar-notif-mark-all-btn"
                      style={{ opacity: notifPage === totalNotifPages ? 0.4 : 1, cursor: notifPage === totalNotifPages ? 'not-allowed' : 'pointer' }}
                    >
                      Next &raquo;
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationOpen(false);
            }}
            className="topbar-user-btn"
            aria-label="User menu"
          >
            <div className="topbar-avatar">
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <ChevronDown className="w-4 h-4 text-ink/50" />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="topbar-dropdown"
              >
                <div className="topbar-dropdown-header">
                  <p className="topbar-dropdown-name">{user?.name || (isAdmin ? 'Admin User' : 'User')}</p>
                  <p className="topbar-dropdown-email">{user?.email || ''}</p>
                </div>
                <Link
                  to={profilePath}
                  onClick={() => setDropdownOpen(false)}
                  className="topbar-dropdown-link"
                >
                  <User className="w-4 h-4 text-ink/50" /> My Profile
                </Link>
                
                <button
                  onClick={logout}
                  className="topbar-dropdown-logout"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <NotificationPopupContainer 
        popups={popups} 
        onDismiss={handleDismissPopup} 
        onClickNotif={handleNotificationClick} 
      />
    </header>
  );
}


