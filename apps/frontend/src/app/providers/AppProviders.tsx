import type { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Ink & Vermillion — Ant Design ConfigProvider theme
 *
 * Remaps every AntD color token to our design system:
 *   primary = Vermilion, base bg = Ink, surface bg = Washi,
 *   border = Charcoal, text = Linen/Stone,
 *   font = DM Sans / JetBrains Mono, radius = 4px.
 *
 * This prevents blue/purple/green AntD defaults from leaking
 * into the UI. Everything the user sees should come from
 * one of the 6 palette colors.
 */
const inkVermillionToken = {
  // ── Primary / Accent: Vermilion ──
  colorPrimary: '#D83A2C',
  colorPrimaryBg: 'rgba(216,58,44,0.1)',
  colorPrimaryBgHover: 'rgba(216,58,44,0.15)',
  colorPrimaryBorder: '#D83A2C',
  colorPrimaryBorderHover: '#B83024',
  colorPrimaryHover: '#B83024',
  colorPrimaryActive: '#9E2820',
  colorPrimaryTextHover: '#B83024',
  colorPrimaryText: '#D83A2C',
  colorPrimaryTextActive: '#9E2820',

  // Status: single accent principle — success/warning use vermilion variants
  colorSuccess: '#D83A2C',
  colorWarning: '#D83A2C',
  colorError: '#D83A2C',
  colorInfo: '#787878',
  colorSuccessBg: 'rgba(216,58,44,0.1)',
  colorWarningBg: 'rgba(216,58,44,0.08)',
  colorErrorBg: 'rgba(216,58,44,0.08)',
  colorInfoBg: 'rgba(120,120,120,0.1)',
  colorSuccessBorder: 'rgba(216,58,44,0.3)',
  colorWarningBorder: 'rgba(216,58,44,0.25)',
  colorErrorBorder: 'rgba(216,58,44,0.3)',
  colorInfoBorder: 'rgba(120,120,120,0.25)',

  // ── Background: Ink / Washi ──
  colorBgBase: '#0C0C0C',
  colorBgContainer: '#1A1A1A',
  colorBgElevated: '#1A1A1A',
  colorBgLayout: '#0C0C0C',
  colorBgSpotlight: '#1A1A1A',
  colorBgMask: 'rgba(0,0,0,0.65)',

  // ── Text: Linen / Stone ──
  colorTextBase: '#E6E0D8',
  colorText: '#E6E0D8',
  colorTextSecondary: '#787878',
  colorTextTertiary: '#787878',
  colorTextQuaternary: '#787878',
  colorTextPlaceholder: '#787878',
  colorTextDisabled: '#2E2E2E',
  colorTextHeading: '#E6E0D8',
  colorTextLabel: '#787878',
  colorTextDescription: '#787878',

  // ── Border & Radius ──
  borderRadius: 4,
  borderRadiusLG: 6,
  borderRadiusSM: 2,
  borderRadiusXS: 2,
  borderRadiusOuter: 4,
  colorBorder: '#2E2E2E',
  colorBorderSecondary: '#1A1A1A',
  colorSplit: '#2E2E2E',

  // ── Typography ──
  fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
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

  // ── Shadow — no glow, no blur, just minimal depth ──
  boxShadow: 'none',
  boxShadowSecondary: '0 0 0 1px rgba(46,46,46,0.5)',
  boxShadowTertiary: 'none',

  // ── Link ──
  colorLink: '#D83A2C',
  colorLinkHover: '#B83024',
  colorLinkActive: '#9E2820',

  // ── Fill (used by Tag, Badge bg, etc) ──
  colorFill: 'rgba(120,120,120,0.1)',
  colorFillSecondary: 'rgba(120,120,120,0.06)',
  colorFillTertiary: 'rgba(120,120,120,0.04)',
  colorFillQuaternary: 'rgba(120,120,120,0.02)',
};

export function AppProviders(props: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: inkVermillionToken,
        components: {
          Menu: {
            itemBorderRadius: 4,
            itemMarginInline: 8,
            itemHeight: 42,
            iconSize: 18,
            collapsedIconSize: 20,
            darkItemBg: '#1A1A1A',
            darkItemColor: '#E6E0D8',
            darkItemSelectedBg: 'rgba(216,58,44,0.12)',
            darkItemSelectedColor: '#D83A2C',
            darkItemHoverBg: 'rgba(120,120,120,0.08)',
            darkItemHoverColor: '#E6E0D8',
            darkSubMenuItemBg: '#1A1A1A',
            darkPopupBg: '#1A1A1A',
          },
          Button: {
            fontWeight: 600,
            paddingInline: 20,
            paddingInlineLG: 28,
            primaryShadow: 'none',
            defaultBorderColor: '#2E2E2E',
            defaultColor: '#E6E0D8',
            defaultBg: '#1A1A1A',
            defaultHoverBg: '#2E2E2E',
            defaultHoverBorderColor: '#787878',
            defaultHoverColor: '#E6E0D8',
          },
          Card: {
            paddingLG: 24,
            borderRadiusLG: 4,
            colorBgContainer: '#1A1A1A',
          },
          Table: {
            headerBg: '#1A1A1A',
            headerColor: '#787878',
            rowHoverBg: 'rgba(216,58,44,0.04)',
            borderColor: '#2E2E2E',
          },
          Modal: {
            borderRadiusLG: 4,
            paddingLG: 24,
            colorBgElevated: '#1A1A1A',
            headerBg: '#1A1A1A',
            contentBg: '#1A1A1A',
          },
          Tag: {
            borderRadiusSM: 2,
            defaultBg: 'rgba(120,120,120,0.1)',
            defaultColor: '#E6E0D8',
          },
          Tabs: {
            inkBarColor: '#D83A2C',
            itemActiveColor: '#D83A2C',
            itemHoverColor: '#E6E0D8',
            itemSelectedColor: '#D83A2C',
          },
          Input: {
            activeBorderColor: '#D83A2C',
            hoverBorderColor: '#787878',
            colorBgContainer: '#1A1A1A',
            colorBorder: '#2E2E2E',
            colorText: '#E6E0D8',
            colorTextPlaceholder: '#787878',
            borderRadius: 4,
          },
          Select: {
            colorBgContainer: '#1A1A1A',
            colorBorder: '#2E2E2E',
            colorText: '#E6E0D8',
            colorTextPlaceholder: '#787878',
            optionActiveBg: 'rgba(216,58,44,0.1)',
            optionSelectedBg: 'rgba(216,58,44,0.12)',
            borderRadius: 4,
          },
          Dropdown: {
            colorBgElevated: '#1A1A1A',
            controlItemBgHover: 'rgba(216,58,44,0.1)',
          },
          Tooltip: {
            // colorBgDefault: '#1A1A1A',
            colorTextLightSolid: '#E6E0D8',
          },
          Notification: {
            colorBgElevated: '#1A1A1A',
          },
          Message: {
            colorBgElevated: '#1A1A1A',
            contentBg: '#1A1A1A',
          },
          Spin: {
            colorPrimary: '#D83A2C',
          },
          Slider: {
            trackBg: '#D83A2C',
            trackHoverBg: '#B83024',
            handleColor: '#D83A2C',
            handleActiveColor: '#B83024',
          },
          Progress: {
            defaultColor: '#D83A2C',
          },
          Switch: {
            colorPrimary: '#D83A2C',
            colorPrimaryHover: '#B83024',
          },
          Radio: {
            colorPrimary: '#D83A2C',
            buttonSolidCheckedBg: '#D83A2C',
            buttonSolidCheckedHoverBg: '#B83024',
          },
          Checkbox: {
            colorPrimary: '#D83A2C',
            colorPrimaryHover: '#B83024',
          },
          DatePicker: {
            activeBorderColor: '#D83A2C',
            hoverBorderColor: '#787878',
            cellActiveWithRangeBg: 'rgba(216,58,44,0.1)',
            cellHoverWithRangeBg: 'rgba(216,58,44,0.05)',
            // cellRangeEdgeTodayHoverBorderColor: '#D83A2C',
          },
          Pagination: {
            itemActiveBg: '#D83A2C',
            colorPrimary: '#D83A2C',
            colorPrimaryHover: '#B83024',
          },
          Segmented: {
            itemSelectedBg: '#D83A2C',
            trackBg: 'rgba(120,120,120,0.08)',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {props.children}
          <ToastContainer position="bottom-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
