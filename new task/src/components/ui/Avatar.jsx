import { getInitial, classNames } from '../../utils/helpers';

const sizes = {
  sm: 'user-avatar-sm',
  md: 'user-avatar-md',
  lg: 'user-avatar-lg',
};

export default function Avatar({ name, size = 'md', className = '' }) {
  return (
    <div
      className={classNames(
        'user-avatar',
        sizes[size],
        className
      )}
    >
      {getInitial(name)}
    </div>
  );
}

