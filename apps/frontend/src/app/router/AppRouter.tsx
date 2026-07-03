import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import type { IMatch, IProblem } from '@ocj/types';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShellLayout } from '../layouts/AppShellLayout';
import { AuthPage } from '../../features/auth/AuthPage';
import { MatchFindingView } from '../../views/MatchFindingView';
import { SoloEditorView } from '../../views/SoloEditorView';
import { RankingView } from '../../views/RankingView';
import { ShopView } from '../../views/ShopView';
import { ContestView } from '../../views/ContestView';
import { SettingsView } from '../../views/SettingsView';
import { AIView } from '../../views/AIView';
import { ApiTesterView } from '../../views/tester/ApiTesterView';
import { ProblemsView } from '../../views/ProblemsView';
import { SubmissionsView } from '../../views/SubmissionsView';
import { CustomRoomsView } from '../../views/CustomRoomsView';
import { AdminDashboard } from '../../views/AdminDashboard';
import { FriendsView } from '../../views/FriendsView';
import { useMatchStore } from '../../stores/match.store';

/* =====================================================
   Route Wrappers — bridge legacy views to Zustand stores
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
        nav('/editor');
      }}
    />
  );
}

function EditorRouteWrapper() {
  const activeMatch = useMatchStore((s) => s.activeMatch);
  const selectedProblem = useMatchStore((s) => s.selectedProblem);

  return (
    <SoloEditorView
      activeMatch={activeMatch ?? undefined}
      problemSlug={selectedProblem?.slug ?? null}
    />
  );
}

function ProblemsRouteWrapper() {
  const nav = useNavigate();
  const setSelectedProblem = useMatchStore((s) => s.setSelectedProblem);

  return (
    <ProblemsView
      onSelectProblem={(slug) => {
        setSelectedProblem({ slug } as unknown as IProblem);
        nav('/editor');
      }}
    />
  );
}

function CustomRoomsRouteWrapper() {
  const nav = useNavigate();
  const setActiveMatch = useMatchStore((s) => s.setActiveMatch);

  return (
    <CustomRoomsView
      onStartCustomMatch={(matchId, problemId) => {
        setActiveMatch({ id: matchId, problem_id: problemId } as unknown as IMatch);
        nav('/editor');
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

        {/* ── Protected App Shell ── */}
        <Route
          element={
            <ProtectedRoute>
              <AppShellLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/match" replace />} />

          {/* ── Match & Editor ── */}
          <Route path="/match" element={<MatchRouteWrapper />} />
          <Route path="/editor" element={<EditorRouteWrapper />} />

          {/* ── Problems ── */}
          <Route path="/problems" element={<ProblemsRouteWrapper />} />

          {/* ── Competitions ── */}
          <Route path="/contest" element={<ContestView />} />
          <Route path="/ranking" element={<RankingView />} />
          <Route path="/custom-rooms" element={<CustomRoomsRouteWrapper />} />

          {/* ── Community ── */}
          <Route path="/submissions" element={<SubmissionsView />} />
          <Route path="/friends" element={<FriendsView />} />

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
