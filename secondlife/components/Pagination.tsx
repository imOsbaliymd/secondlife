import React from 'react';

interface Props {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ current, total, onChange }) => {
  if (total <= 1) return null;

  const prev = () => onChange(Math.max(1, current - 1));
  const next = () => onChange(Math.min(total, current + 1));

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={prev}
        disabled={current === 1}
        className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        上一页
      </button>
      <span className="text-xs text-gray-500">第 {current} / {total} 页</span>
      <button
        onClick={next}
        disabled={current === total}
        className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        下一页
      </button>
    </div>
  );
};

export default Pagination;