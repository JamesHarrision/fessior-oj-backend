import type { ReactNode } from 'react';
import { Card } from 'antd';

export function SurfaceCard(props: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card
      title={props.title}
      className={props.className}
      styles={{
        header: { borderBottom: '1px solid rgba(148,163,184,0.18)', paddingInline: 18 },
        body: { padding: 18 },
      }}
    >
      {props.children}
    </Card>
  );
}

