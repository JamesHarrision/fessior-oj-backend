import { Spin } from 'antd';

export function LoadingScreen(props: { label?: string }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-3 px-6 py-10">
        <Spin size="large" />
        <div className="text-sm text-slate-400">{props.label ?? 'Đang tải…'}</div>
      </div>
    </div>
  );
}

