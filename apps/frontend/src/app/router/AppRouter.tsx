import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
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
import { useState } from 'react';
import type { IMatch } from '@ocj/types';

function MatchRoute(props: { onStartMatch: (m: IMatch) => void }) {
  const navigate = useNavigate();
  return (
    <MatchFindingView
      onStartMatch={(m) => {
        props.onStartMatch(m as unknown as IMatch);
        navigate('/editor');
      }}
    />
  );
}

function ProblemsRoute(props: { onSelectProblem: (slug: string) => void }) {
  const navigate = useNavigate();
  return (
    <ProblemsView
      onSelectProblem={(slug) => {
        props.onSelectProblem(slug);
        navigate('/editor');
      }}
    />
  );
}

function CustomRoomsRoute(props: { onStartCustomMatch: (matchId: string, problemId: string) => void }) {
  const navigate = useNavigate();
  return (
    <CustomRoomsView
      onStartCustomMatch={(matchId, problemId) => {
        props.onStartCustomMatch(matchId, problemId);
        navigate('/editor');
      }}
    />
  );
}

function AdminRoute() {
  const navigate = useNavigate();
  const params = useParams<{ subview?: string }>();
  const currentSubView = `admin/${params.subview ?? 'problems'}`;
  return <AdminDashboard currentSubView={currentSubView} onViewChange={(view) => navigate(`/${view}`)} />;
}

export function AppRouter() {
  const [activeMatch, setActiveMatch] = useState<IMatch | undefined>(undefined);
  const [selectedProblemSlug, setSelectedProblemSlug] = useState<string | null>(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute><AppShellLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/match" replace />} />
          <Route
            path="/match"
            element={
              <MatchRoute
                onStartMatch={(m) => {
                  setActiveMatch(m);
                  setSelectedProblemSlug(null);
                }}
              />
            }
          />
          <Route path="/editor" element={<SoloEditorView activeMatch={activeMatch} problemSlug={selectedProblemSlug} />} />
          <Route path="/ranking" element={<RankingView />} />
          <Route path="/shop" element={<ShopView />} />
          <Route path="/contest" element={<ContestView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/ai" element={<AIView />} />
          <Route path="/tester" element={<ApiTesterView />} />
          <Route path="/problems" element={<ProblemsRoute onSelectProblem={(slug) => setSelectedProblemSlug(slug)} />} />
          <Route path="/submissions" element={<SubmissionsView />} />
          <Route path="/custom-rooms" element={<CustomRoomsRoute onStartCustomMatch={(matchId, problemId) => setActiveMatch({ id: matchId, problem_id: problemId } as unknown as IMatch)} />} />
          <Route path="/admin/:subview" element={<AdminRoute />} />
          <Route path="/admin" element={<Navigate to="/admin/problems" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
