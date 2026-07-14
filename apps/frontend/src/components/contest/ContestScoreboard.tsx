import React from 'react';

interface ContestScoreboardProps {
  leaderboardData: any;
}

export const ContestScoreboard: React.FC<ContestScoreboardProps> = ({ leaderboardData }) => {
  if (!leaderboardData) return null;

  return (
    <div className="bg-ink border border-charcoal p-4 overflow-x-auto">
      <h3 className="font-display font-bold text-linen mb-4 text-lg">Bảng Xếp Hạng</h3>
      <table className="w-full text-left font-body text-sm">
        <thead>
          <tr className="border-b border-charcoal text-stone">
            <th className="py-2 px-4 font-bold">Hạng</th>
            <th className="py-2 px-4 font-bold">Thí sinh</th>
            <th className="py-2 px-4 font-bold">Điểm</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal">
          {(leaderboardData.items || []).map((item: any, index: number) => (
            <tr key={index} className="text-linen hover:bg-washi transition-colors">
              <td className="py-3 px-4">{index + 1}</td>
              <td className="py-3 px-4">{item.username || item.user_id || 'Unknown'}</td>
              <td className="py-3 px-4">{item.score || 0}</td>
            </tr>
          ))}
          {(!leaderboardData.items || leaderboardData.items.length === 0) && (
            <tr>
              <td colSpan={3} className="py-6 px-4 text-center text-stone font-body">
                Chưa có dữ liệu xếp hạng.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
