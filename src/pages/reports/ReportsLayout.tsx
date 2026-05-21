import { Outlet } from 'react-router-dom';
import { PageLayout } from '../../layouts/PageLayout';

export default function ReportsLayout() {
  return (
    <PageLayout noScroll className="min-h-0">
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-contain bg-slate-50/80 dark:bg-slate-900/50">
        <Outlet />
      </div>
    </PageLayout>
  );
}
