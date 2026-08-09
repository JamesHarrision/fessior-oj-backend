import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import type { IMatch } from '@ocj/types';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShellLayout } from '../layouts/AppShellLayout';
import { AuthPage } from '../../features/auth/AuthPage';
import { HomeView } from '../../views/HomeView';
import ChatPage from '../../features/chat/pages/ChatPage';
import { ProblemsPage } from '../../features/problems/ProblemsPage';
import { MatchFindingView } from '../../views/MatchFindingView';
import { SoloSolveView } from '../../views/SoloSolveView';
import { PvPWorkspaceView } from '../../views/PvPWorkspaceView';
import { PlaygroundView } from '../../views/PlaygroundView';
import { RankingView } from '../../views/RankingView';
import { SettingsView } from '../../views/SettingsView';
import { SubmissionsView } from '../../views/SubmissionsView';
import { CustomRoomsView } from '../../views/CustomRoomsView';
import { AdminDashboard } from '../../views/AdminDashboard';
import { TokenProofView } from '../../views/TokenProofView';
import { ProfileView } from '../../views/ProfileView';
import { useMatchStore } from '../../stores/match.store';
import AboutPage from '../../features/about/pages/AboutPage';

/* =====================================================
   Route Wrappers
   ===================================================== */

function MatchRouteWrapper() {
  const nav = useNavigate();
  const setActiveMatch = useMatchStore((s) => s.setActiveMatch);
  const setSelectedProblem = useMatchStore((s) => s.setSelectedProblem);

  return (
    <MatchFindingView
      onStartMatch={(m) => {
        setActiveMatch(m as unknown as IMatch);
        setSelectedProblem(null);
        nav(`/match/${(m as any).id ?? (m as any).matchId}`);
      }}
    />
  );
}

function CustomRoomsRouteWrapper() {
  const nav = useNavigate();
  const setActiveMatch = useMatchStore((s) => s.setActiveMatch);

  return (
    <CustomRoomsView
      onStartCustomMatch={(matchId, _problemId) => {
        setActiveMatch({ id: matchId } as unknown as IMatch);
        nav(`/match/${matchId}`);
      }}
    />
  );
}

function AdminRouteWrapper() {
  const nav = useNavigate();
  const params = useParams<{ subview?: string }>();
  const currentSubView = `admin/${params.subview ?? 'problems'}`;

  return (
    <AdminDashboard
      currentSubView={currentSubView}
      onViewChange={(view) => nav(`/${view}`)}
    />
  );
}

/* =====================================================
   AppRouter — main application router
   ===================================================== */

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/token-proof" element={<TokenProofView />} />

        {/* ── Protected App Shell ── */}
        <Route
          element={
            <ProtectedRoute>
              <AppShellLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeView />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* ── Match & Solving ── */}
          <Route path="/match" element={<MatchRouteWrapper />} />
          <Route path="/match/:matchId" element={<PvPWorkspaceView />} />
          <Route path="/solve/:problemSlug" element={<SoloSolveView />} />
          <Route path="/editor" element={<PlaygroundView />} />

          {/* ── Problems ── */}
          <Route path="/problems" element={<ProblemsPage />} />

          <Route path="/ranking" element={<RankingView />} />
          <Route path="/custom-rooms" element={<CustomRoomsRouteWrapper />} />

          {/* ── Community ── */}
          <Route path="/submissions" element={<SubmissionsView />} />
          <Route path="/profile/:username" element={<ProfileView />} />
          <Route path="/about" element={<AboutPage />} />

          {/* ── Tools ── */}
          <Route path="/settings" element={<SettingsView />} />
        </Route>

        {/* ── Protected Admin Shell ── */}
        <Route path="/admin/:subview" element={<ProtectedRoute><AdminRouteWrapper /></ProtectedRoute>} />
        <Route path="/admin" element={<Navigate to="/admin/problems" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
