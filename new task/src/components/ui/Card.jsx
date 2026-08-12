import { motion } from 'framer-motion';
import { classNames } from '../../utils/helpers';

export default function Card({ children, className = '', hover = false, onClick, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={classNames('ui-card', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

