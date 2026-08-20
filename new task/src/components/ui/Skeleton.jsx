import { classNames } from '../../utils/helpers';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={classNames('skeleton-box', className)}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="space-y-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
       {Array.from({ length: rows }).map((_, rowIndex) => {
        const rowId = `tbl-skel-row-${rowIndex}`;
        return (
          <div key={rowId} style={{ display: 'flex', gap: '1rem' }}>
            {Array.from({ length: cols }).map((__, colIndex) => {
              const colId = `tbl-skel-col-${rowIndex}-${colIndex}`;
              return (
                <Skeleton key={colId} style={{ height: '2.25rem', flex: 1 }} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
export function CardSkeleton() {
  return (
    <div className="ui-card ui-card-p5" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Skeleton style={{ height: '1rem', width: '6rem' }} />
      <Skeleton style={{ height: '1.75rem', width: '4rem' }} />
    </div>
  );
}
