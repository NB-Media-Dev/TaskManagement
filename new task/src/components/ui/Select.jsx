import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { classNames } from '../../utils/helpers';

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder = 'Select...', className = '', containerClassName = '', ...props },
  ref
) {
  return (
    <div className={classNames('form-group', containerClassName)}>
      {label && <label className="form-label">{label}</label>}
      <div className="input-relative">
        <select
          ref={ref}
          className={classNames(
            'form-select',
            error ? 'has-error' : '',
            className
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="select-chevron" />
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

export default Select;

