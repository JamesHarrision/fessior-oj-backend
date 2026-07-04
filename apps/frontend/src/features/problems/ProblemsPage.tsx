import { useMemo, useState } from 'react';
import { Input, Select, Spin, Tag } from 'antd';
import { SearchOutlined, BookOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageHeader, EmptyState, DifficultyBadge } from '@ocj/ui';
import { useProblems } from './hooks/useProblems';
import { useMatchStore } from '../../stores/match.store';
import type { IProblem, ITag } from '@ocj/types';

/* ─── Constants ─── */

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All Difficulties' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

/* ─── ProblemCard ─── */

function ProblemCard(props: { problem: IProblem; onSelect: (slug: string) => void }) {
  const { problem, onSelect } = props;
  const difficulty = (problem.difficulty ?? 'EASY') as 'EASY' | 'MEDIUM' | 'HARD';
  const tags = (problem.tags ?? []) as ITag[];

  return (
    <div
      className="!bg-white !rounded-2xl !border !border-surface-200 !shadow-[0_1px_3px_rgba(0,0,0,0.06)] !p-6
                 hover:!shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:!border-emerald-500/30 hover:-translate-y-1
                 transition-all duration-300 cursor-pointer !flex !flex-col !justify-between !min-h-[200px]"
      onClick={() => onSelect(problem.slug)}
    >
      <div>
        <div className="!flex !items-center !justify-between !mb-3">
          <DifficultyBadge difficulty={difficulty} />
          <span className="!text-[11px] !font-semibold !text-surface-400 !uppercase !tracking-wider">
            {problem.timeLimit ?? 2000}ms · {problem.memoryLimit ?? 256}MB
          </span>
        </div>

        <h3 className="!text-[15px] !font-semibold !text-navy-850 !mb-2 !leading-snug"
            style={{ fontFamily: "'Clash Display', sans-serif" }}>
          {problem.title}
        </h3>

        {tags.length > 0 && (
          <div className="!flex !flex-wrap !gap-1.5 !mb-3">
            {tags.slice(0, 3).map((t) => (
              <Tag key={t.id ?? t.slug} color="default" className="!text-[10px] !m-0 !rounded-md">
                {t.name}
              </Tag>
            ))}
            {tags.length > 3 && (
              <span className="!text-[10px] !text-surface-400 !self-center">+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <button
        className="!w-full !flex !items-center !justify-center !gap-2 !py-2.5 !rounded-lg
                   !bg-emerald-500 hover:!bg-emerald-600 !text-white !text-[13px] !font-semibold
                   !border-none !cursor-pointer transition-colors duration-200"
      >
        Solve Now <ArrowRightOutlined className="!text-xs" />
      </button>
    </div>
  );
}

/* ─── FilterBar ─── */

function FilterBar(props: {
  search: string;
  onSearchChange: (v: string) => void;
  difficulty: string;
  onDifficultyChange: (v: string) => void;
  selectedTag: string;
  onTagChange: (v: string) => void;
  tags: ITag[];
}) {
  return (
    <div className="!bg-white !rounded-2xl !border !border-surface-200 !shadow-[0_1px_3px_rgba(0,0,0,0.06)] !p-4
                    !grid !grid-cols-1 sm:!grid-cols-[2fr_1fr_1fr] !gap-3">
      <Input
        prefix={<SearchOutlined className="!text-surface-400" />}
        placeholder="Search problems..."
        value={props.search}
        onChange={(e) => props.onSearchChange(e.target.value)}
        allowClear
        className="!h-[42px] !rounded-lg !bg-surface-50 !border-surface-200 hover:!border-emerald-500"
      />

      <Select
        value={props.difficulty}
        onChange={props.onDifficultyChange}
        options={DIFFICULTY_OPTIONS}
        className="!w-full"
        classNames={{ popup: { root: '!rounded-lg' } }}
        size="large"
      />

      <Select
        value={props.selectedTag}
        onChange={props.onTagChange}
        placeholder="All Topics"
        allowClear
        options={[
          { value: '', label: 'All Topics' },
          ...props.tags.map((t) => ({ value: t.slug ?? t.name ?? '', label: t.name })),
        ]}
        className="!w-full"
        classNames={{ popup: { root: '!rounded-lg' } }}
        size="large"
      />
    </div>
  );
}

/* ─── ProblemsPage ─── */

export function ProblemsPage() {
  const navigate = useNavigate();
  const { problems, tags, isLoading, isError } = useProblems();
  const setSelectedProblem = useMatchStore((s) => s.setSelectedProblem);

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch = !q
        || p.title.toLowerCase().includes(q)
        || p.slug.toLowerCase().includes(q);
      const matchesDifficulty = !difficulty || p.difficulty === difficulty;
      const matchesTag = !selectedTag
        || (p.tags && p.tags.some((t: ITag) => t.slug === selectedTag || t.name === selectedTag));
      return matchesSearch && matchesDifficulty && matchesTag;
    });
  }, [problems, search, difficulty, selectedTag]);

  const handleSelect = (slug: string) => {
    const problem = problems.find((p) => p.slug === slug) ?? null;
    setSelectedProblem(problem);
    navigate(`/solve/${slug}`);
  };

  return (
    <div className="!space-y-6">
      <PageHeader
        title="Problems"
        subtitle="Browse our collection of algorithm challenges and sharpen your skills"
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        tags={tags}
      />

      {isLoading ? (
        <div className="!flex !justify-center !py-20">
          <Spin size="large" />
        </div>
      ) : isError ? (
        <div className="!bg-white !rounded-2xl !border !border-surface-200 !p-12">
          <EmptyState
            icon={<BookOutlined style={{ fontSize: 48, color: '#94A3B8' }} />}
            title="Failed to load problems"
            description="Please check your connection and try again."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="!bg-white !rounded-2xl !border !border-surface-200 !p-12">
          <EmptyState
            icon={<BookOutlined style={{ fontSize: 48, color: '#94A3B8' }} />}
            title="No problems found"
            description="Try adjusting your filters or search query."
          />
        </div>
      ) : (
        <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-4">
          {filtered.map((p) => (
            <ProblemCard
              key={p.id ?? p._id ?? p.slug}
              problem={p}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
