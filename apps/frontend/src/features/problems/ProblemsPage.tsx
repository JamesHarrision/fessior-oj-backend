import { useMemo, useState } from 'react';
import { Input, Select, Spin, Tag } from 'antd';
import { SearchOutlined, BookOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageHeader, EmptyState, DifficultyBadge } from '@ocj/ui';
import { useProblems } from './hooks/useProblems';
import { useMatchStore } from '../../stores/match.store';
import { Pagination } from '@ocj/ui';
import type { IProblem, ITag } from '@ocj/types';

/* ─── Constants ─── */

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All Difficulties' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

/* ─── ProblemRow ─── */

function ProblemRow(props: { problem: IProblem & { isSolved?: boolean; acceptanceRate?: number; totalSubmissions?: number }; onSelect: (slug: string) => void }) {
  const { problem, onSelect } = props;
  const difficulty = (problem.difficulty ?? 'EASY') as 'EASY' | 'MEDIUM' | 'HARD';
  const tags = (problem.tags ?? []) as ITag[];

  return (
    <div
      className="!bg-washi !border-b !border-charcoal !px-6 !py-4
                 hover:!bg-ink transition-colors cursor-pointer !flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-4 relative"
      onClick={() => onSelect(problem.slug)}
    >
      <div className="!flex !items-center !gap-4 flex-1">
        <div className="!w-6 !h-6 !flex-shrink-0 !flex !items-center !justify-center">
          {problem.isSolved ? (
            <div className="!w-5 !h-5 !bg-green-500 !rounded-full !flex !items-center !justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="!w-2 !h-2 !bg-stone !rounded-full opacity-30"></div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="!flex !items-center !gap-3 !mb-1">
            <h3 className={`!text-[15px] !font-semibold !leading-snug !m-0 ${problem.isSolved ? '!text-green-500' : '!text-linen'}`}
                style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {problem.title}
            </h3>
            <DifficultyBadge difficulty={difficulty} />
          </div>

          <div className="!flex !items-center !gap-3">
            <span className="!text-[11px] !font-medium !text-stone !uppercase !tracking-wider">
              {problem.acceptanceRate !== undefined ? `${problem.acceptanceRate}% Tỷ lệ giải` : 'Chưa có tỷ lệ'}
            </span>
            
            {tags.length > 0 && (
              <div className="!flex !flex-wrap !gap-1.5 !ml-2">
                {tags.slice(0, 3).map((t) => (
                  <Tag key={t.id ?? t.slug} color="default" className="!text-[10px] !m-0 !rounded-md !border-charcoal !bg-ink !text-stone">
                    {t.name}
                  </Tag>
                ))}
                {tags.length > 3 && (
                  <span className="!text-[10px] !text-stone !self-center">+{tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        className={`!shrink-0 !flex !items-center !justify-center !gap-2 !px-5 !py-2 !rounded-lg
                   !text-linen !text-[12px] !font-semibold !border-none !cursor-pointer transition-colors duration-200
                   ${problem.isSolved ? '!bg-green-600 hover:!bg-green-500' : '!bg-vermilion hover:!bg-vermilion-hover'}`}
        onClick={(e) => { e.stopPropagation(); onSelect(problem.slug); }}
      >
        {problem.isSolved ? 'Đã giải' : 'Solve Now'} <ArrowRightOutlined className="!text-xs" />
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
    <div className="!bg-washi !rounded-2xl !border !border-charcoal !p-4
                    !grid !grid-cols-1 sm:!grid-cols-[2fr_1fr_1fr] !gap-3">
      <Input
        prefix={<SearchOutlined className="!text-stone" />}
        placeholder="Search problems..."
        value={props.search}
        onChange={(e) => props.onSearchChange(e.target.value)}
        allowClear
        className="!h-[42px] !rounded-lg !bg-ink !border-charcoal hover:!border-vermilion"
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, difficulty, selectedTag]);

  const currentProblems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage]);

  const handleSelect = (slug: string) => {
    const problem = problems.find((p) => p.slug === slug) ?? null;
    setSelectedProblem(problem);
    navigate(`/solve/${slug}`);
  };

  return (
    <div className="!space-y-6">
      <div className="!flex !flex-col sm:!flex-row !justify-between !items-start sm:!items-center !gap-4">
        <PageHeader
          title="Problems"
          subtitle="Browse our collection of algorithm challenges and sharpen your skills"
        />
        <button
          onClick={() => {
            if (filtered.length > 0) {
              const randIdx = Math.floor(Math.random() * filtered.length);
              handleSelect(filtered[randIdx].slug);
            }
          }}
          className="!flex !items-center !gap-2 !bg-ink !border !border-charcoal !px-4 !py-2 !rounded-lg !text-linen !font-semibold hover:!border-vermilion hover:!text-vermilion transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Pick Random
        </button>
      </div>

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
        <div className="!bg-washi !rounded-2xl !border !border-charcoal !p-12">
          <EmptyState
            icon={<BookOutlined style={{ fontSize: 48, color: '#94A3B8' }} />}
            title="Failed to load problems"
            description="Please check your connection and try again."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="!bg-washi !rounded-2xl !border !border-charcoal !p-12">
          <EmptyState
            icon={<BookOutlined style={{ fontSize: 48, color: '#94A3B8' }} />}
            title="No problems found"
            description="Try adjusting your filters or search query."
          />
        </div>
      ) : (
        <div className="!bg-ink !border !border-charcoal !rounded-2xl !overflow-hidden">
          <div className="!flex !flex-col">
            {currentProblems.map((p) => (
              <ProblemRow
                key={p.id ?? p._id ?? p.slug}
                problem={p}
                onSelect={handleSelect}
              />
            ))}
          </div>
          
          <div className="!p-6 !border-t !border-charcoal !bg-washi">
            <Pagination 
              currentPage={currentPage}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
