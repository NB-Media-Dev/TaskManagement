import { Search } from 'lucide-react';
import { classNames } from '../../utils/helpers';

export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search...', className = '' }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={classNames('input-relative', className)}
    >
      <Search className="input-icon" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input has-icon"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="select-chevron"
          style={{ pointerEvents: 'auto', cursor: 'pointer', background: 'none', border: 'none' }}
          aria-label="Clear search"
        >
          &times;
        </button>
      )}
    </form>
  );
}

