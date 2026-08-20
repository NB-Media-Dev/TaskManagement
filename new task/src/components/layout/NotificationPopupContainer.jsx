import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  UserPlus, 
  ClipboardList, 
  Edit3, 
  MessageSquare, 
  AlertTriangle, 
  X
} from 'lucide-react';

const getNotifIcon = (type) => {
  switch (type) {
    case 'EMPLOYEE_ADDED':
      return <UserPlus className="w-5 h-5 text-indigo-500" />;
    case 'TASK_ASSIGNED':
      return <ClipboardList className="w-5 h-5 text-emerald-500" />;
    case 'TASK_UPDATED_BY_EMPLOYEE':
      return <Edit3 className="w-5 h-5 text-amber-500" />;
    case 'TASK_UPDATED_BY_TL':
    case 'TASK_REVIEWED_BY_TL':
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case 'TASK_OVERDUE':
    case 'OVERDUE':
      return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    default:
      return <Bell className="w-5 h-5 text-indigo-500" />;
  }
};

export default function NotificationPopupContainer({ popups, onDismiss, onClickNotif }) {
  if (!popups || popups.length === 0) return null;

  return (
    <div className="notif-popup-container">
      <AnimatePresence>
        {popups.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="notif-popup-card"
            onClick={() => onClickNotif(notif)}
          >
            <div className="notif-popup-icon-wrap">
              {getNotifIcon(notif.type)}
            </div>

            <div className="notif-popup-content">
              <div className="notif-popup-header">
                <span className="notif-popup-badge">New Notification</span>
                <span className="notif-popup-time">{notif.created_at || 'Just now'}</span>
              </div>
              <h4 className="notif-popup-title">{notif.title}</h4>
              <p className="notif-popup-msg">{notif.message}</p>
              
            </div>

            <button
              className="notif-popup-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notif.id);
              }}
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="notif-popup-progress" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
