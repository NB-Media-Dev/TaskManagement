import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui';

export default function ErrorPage() {
  return (
    <div className="state-container" style={{ minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: '28rem' }}
      >
        <div className="state-icon-badge-primary" style={{ margin: '0 auto 1.5rem auto', width: '5rem', height: '5rem' }}>
          <AlertTriangle className="w-9 h-9 text-primary" />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.5rem 0' }}>404</h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem 0' }}>Page not found</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', margin: '0 0 2rem 0' }}>
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link to="/">
          <Button size="lg">
            <Home className="w-4 h-4" /> Back to sign in
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

