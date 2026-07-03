import type { ReactNode } from 'react';

export function FullPageCenter(props: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        {props.children}
      </div>
    </div>
  );
}

