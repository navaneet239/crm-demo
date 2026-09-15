import React from 'react';

export const Skeleton: React.FC<{
  className?: string;
  id?: string;
}> = ({ className = '', id }) => {
  return (
    <div
      id={id}
      className={`animate-pulse bg-[#E7EEF7]/70 rounded ${className}`}
    />
  );
};

export const StatCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-[8px] border border-[#DDE3EC] card-shadow"
        >
          <Skeleton className="h-3 w-28 mb-3" />
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-36" />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
  return (
    <div className="bg-white rounded-[8px] border border-[#DDE3EC] card-shadow overflow-hidden">
      <div className="h-11 bg-[#F0F4F9] border-b border-[#DDE3EC] px-6 flex items-center justify-between">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-20" />
      </div>
      <div className="divide-y divide-[#DDE3EC]">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div>
                <Skeleton className="h-4 w-36 mb-1.5" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const KanbanSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {[1, 2, 3, 4, 5, 6].map((col) => (
        <div
          key={col}
          className="bg-[#F0F4F9] rounded-[8px] p-3 border border-[#DDE3EC] min-w-[240px] flex flex-col gap-3"
        >
          <div className="flex items-center justify-between pb-1">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="bg-white p-3.5 rounded-[8px] border border-[#DDE3EC] card-shadow"
            >
              <Skeleton className="h-4 w-28 mb-2" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[8px] border border-[#DDE3EC] card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-[8px]" />
            <Skeleton className="h-9 w-24 rounded-[8px]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-[8px] border border-[#DDE3EC] card-shadow space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[8px] border border-[#DDE3EC] card-shadow space-y-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
};
