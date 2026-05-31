import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';

// Mock AuthContext hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock API service calls
vi.mock('../../services/api', () => ({
  api: {
    getNotifications: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
}));

describe('Navbar Component', () => {
  const mockUser = {
    id: '123',
    username: 'test_user',
    elo_rating: 1200,
    streak_count: 5,
    max_streak: 10,
    role: 'USER' as const,
  };

  it('renders logo, streak, and mock user information', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
    });

    await act(async () => {
      render(<Navbar currentView="match" onViewChange={vi.fn()} />);
    });

    // Verify logo parts
    expect(screen.getByText('QUEU')).toBeInTheDocument();
    expect(screen.getByText('ARENA')).toBeInTheDocument();

    // Verify streak count
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('triggers onViewChange when a nav link is clicked', async () => {
    const onViewChangeMock = vi.fn();
    (useAuth as any).mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
    });

    await act(async () => {
      render(<Navbar currentView="match" onViewChange={onViewChangeMock} />);
    });

    const shopButton = screen.getByText('Shop');
    await act(async () => {
      fireEvent.click(shopButton);
    });

    expect(onViewChangeMock).toHaveBeenCalledWith('shop');
  });

  it('displays profile dropdown menu upon clicking profile area', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
    });

    await act(async () => {
      render(<Navbar currentView="match" onViewChange={vi.fn()} />);
    });

    const profileImage = screen.getByAltText('User Avatar');
    await act(async () => {
      fireEvent.click(profileImage);
    });

    // Verify user information shown inside dropdown
    expect(screen.getByText('test_user')).toBeInTheDocument();
    expect(screen.getByText('1200 ELO')).toBeInTheDocument();
    expect(screen.getByText('Đăng xuất')).toBeInTheDocument();
  });
});
