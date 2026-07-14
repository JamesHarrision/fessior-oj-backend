import type { RoadmapResponse, SavedRoadmap } from "../types/roadmap.types";

const now = Date.now();

export const mockRoadmapResponse: RoadmapResponse = {
  status: "Success",
  data: {
    title: "Personalized DSA Roadmap",
    description:
      "A structured path generated from your current skill level and interview goals.",
    nodes: [
      {
        id: "node-arrays",
        title: "Arrays and Hashing",
        description: "Build fluency with traversal, frequency maps, and two-pointer patterns.",
        estimatedWeeks: 1,
        difficulty: "EASY",
        recommendedProblems: ["two-sum", "contains-duplicate", "valid-anagram", "group-anagrams"],
      },
      {
        id: "node-recursion",
        title: "Recursion Basics",
        description: "Practice base cases, branching decisions, and recursive tracing.",
        estimatedWeeks: 1,
        difficulty: "MEDIUM",
        recommendedProblems: ["climbing-stairs", "subsets", "permutations", "combination-sum"],
      },
      {
        id: "node-dp",
        title: "Dynamic Programming",
        description: "Move from brute force recursion to memoization and tabulation.",
        estimatedWeeks: 2,
        difficulty: "HARD",
        recommendedProblems: [
          "house-robber",
          "coin-change",
          "longest-increasing-subsequence",
          "word-break",
          "unique-paths",
        ],
      },
    ],
  },
};

export const mockSavedRoadmaps: SavedRoadmap[] = [
  {
    id: "mock-roadmap-1",
    createdAt: now - 5 * 24 * 60 * 60 * 1000,
    skillLevel: "BEGINNER",
    focusArea: "Recursion",
    goals: "Prepare for 3-month interview roadmap",
    completedProblemIds: ["two-sum", "contains-duplicate", "valid-anagram"],
    ...mockRoadmapResponse.data,
  },
  {
    id: "mock-roadmap-2",
    createdAt: now - 2 * 24 * 60 * 60 * 1000,
    skillLevel: "INTERMEDIATE",
    focusArea: "Trees",
    goals: "Review tree traversal and graph thinking",
    completedProblemIds: ["invert-binary-tree", "maximum-depth-of-binary-tree"],
    title: "Tree Patterns Roadmap",
    description: "A compact plan for tree traversal, recursion, BFS, DFS, and interview drills.",
    nodes: [
      {
        id: "node-tree-traversal",
        title: "Traversal Patterns",
        description: "Master DFS, BFS, preorder, inorder, and postorder traversal.",
        estimatedWeeks: 1,
        difficulty: "EASY",
        recommendedProblems: [
          "invert-binary-tree",
          "maximum-depth-of-binary-tree",
          "binary-tree-level-order-traversal",
        ],
      },
      {
        id: "node-tree-advanced",
        title: "Tree Reasoning",
        description: "Practice path, ancestor, and subtree problems.",
        estimatedWeeks: 2,
        difficulty: "MEDIUM",
        recommendedProblems: [
          "lowest-common-ancestor",
          "validate-binary-search-tree",
          "diameter-of-binary-tree",
          "serialize-and-deserialize-binary-tree",
        ],
      },
    ],
  },
];
