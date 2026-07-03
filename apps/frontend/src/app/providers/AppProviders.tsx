import type { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 30s stale
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * OCJ Design Token — Light theme base with Navy accents
 * Ant Design ConfigProvider theme token mapping
 */
const ocjThemeToken = {
  // ── Primary: Emerald Green ──
  colorPrimary: '#10B981',
  colorSuccess: '#10B981',
  colorWarning: '#F59E0B',
  colorError: '#EF4444',
  colorInfo: '#0F172A',

  // ── Neutral / Surface ──
  colorBgBase: '#FFFFFF',
  colorBgContainer: '#FFFFFF',
  colorBgElevated: '#FFFFFF',
  colorBgLayout: '#F1F5F9',

  // ── Text ──
  colorTextBase: '#0F172A',
  colorText: '#0F172A',
  colorTextSecondary: '#475569',
  colorTextTertiary: '#64748B',

  // ── Border & Radius ──
  borderRadius: 10,
  borderRadiusLG: 14,
  borderRadiusSM: 8,
  colorBorder: '#E2E8F0',
  colorBorderSecondary: '#F1F5F9',

  // ── Typography ──
  fontFamily: "'Satoshi', system-ui, sans-serif",
  fontFamilyCode: "'JetBrains Mono', ui-monospace, monospace",
  fontSize: 14,
  fontSizeLG: 16,
  fontSizeXL: 20,
  fontSizeHeading1: 32,
  fontSizeHeading2: 24,
  fontSizeHeading3: 20,
  fontSizeHeading4: 18,
  fontSizeHeading5: 16,

  // ── Control heights ──
  controlHeight: 38,
  controlHeightLG: 46,
  controlHeightSM: 30,

  // ── Padding ──
  padding: 16,
  paddingLG: 24,
  paddingSM: 12,
  paddingXS: 8,

  // ── Shadow ──
  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  boxShadowSecondary: '0 10px 25px rgba(0,0,0,0.12)',
};

export function AppProviders(props: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: ocjThemeToken,
        components: {
          Menu: {
            itemBorderRadius: 8,
            itemMarginInline: 8,
            itemHeight: 42,
            iconSize: 18,
            collapsedIconSize: 20,
          },
          Button: {
            fontWeight: 600,
            paddingInline: 20,
            paddingInlineLG: 28,
          },
          Card: {
            paddingLG: 24,
            borderRadiusLG: 14,
          },
          Table: {
            headerBg: '#F8FAFC',
            headerColor: '#475569',
            rowHoverBg: '#F1F5F9',
          },
          Modal: {
            borderRadiusLG: 16,
            paddingLG: 24,
          },
          Tag: {
            borderRadiusSM: 6,
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{props.children}</AuthProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
