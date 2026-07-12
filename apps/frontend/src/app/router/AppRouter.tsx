import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import type { IMatch } from '@ocj/types';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShellLayout } from '../layouts/AppShellLayout';
import { AuthPage } from '../../features/auth/AuthPage';
import { HomeView } from '../../views/HomeView';
import { ProblemsPage } from '../../features/problems/ProblemsPage';
import { MatchFindingView } from '../../views/MatchFindingView';
import { SoloSolveView } from '../../views/SoloSolveView';
import { PvPWorkspaceView } from '../../views/PvPWorkspaceView';
import { ContestSolveView } from '../../views/ContestSolveView';
import { PlaygroundView } from '../../views/PlaygroundView';
import { RankingView } from '../../views/RankingView';
import { ShopView } from '../../views/ShopView';
import { ContestView } from '../../views/ContestView';
import { SettingsView } from '../../views/SettingsView';
import { AIView } from '../../views/AIView';
import { ApiTesterView } from '../../views/tester/ApiTesterView';
import { SubmissionsView } from '../../views/SubmissionsView';
import { CustomRoomsView } from '../../views/CustomRoomsView';
import { AdminDashboard } from '../../views/AdminDashboard';
import { FriendsView } from '../../views/FriendsView';
import { TokenProofView } from '../../views/TokenProofView';
import { ProfileView } from '../../views/ProfileView';
import { useMatchStore } from '../../stores/match.store';

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

          {/* ── Match & Solving ── */}
          <Route path="/match" element={<MatchRouteWrapper />} />
          <Route path="/match/:matchId" element={<PvPWorkspaceView />} />
          <Route path="/solve/:problemSlug" element={<SoloSolveView />} />
          <Route path="/editor" element={<PlaygroundView />} />

          {/* ── Problems ── */}
          <Route path="/problems" element={<ProblemsPage />} />

          {/* ── Competitions ── */}
          <Route path="/contest" element={<ContestView />} />
          <Route path="/contest/:contestId/problem/:problemId" element={<ContestSolveView />} />
          <Route path="/ranking" element={<RankingView />} />
          <Route path="/custom-rooms" element={<CustomRoomsRouteWrapper />} />

          {/* ── Community ── */}
          <Route path="/submissions" element={<SubmissionsView />} />
          <Route path="/friends" element={<FriendsView />} />
          <Route path="/profile/:username" element={<ProfileView />} />

          {/* ── Tools ── */}
          <Route path="/shop" element={<ShopView />} />
          <Route path="/ai" element={<AIView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/tester" element={<ApiTesterView />} />

          {/* ── Admin ── */}
          <Route path="/admin/:subview" element={<AdminRouteWrapper />} />
          <Route path="/admin" element={<Navigate to="/admin/problems" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
