import { Schema, model, Document } from 'mongoose';

export interface IProblem extends Document {
  title: string;
  slug: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit: number;
  memoryLimit: number;
  starterCodes: {
    cpp: string;
    java: string;
    python: string;
  };
  editorialMarkdown?: string;
  editorialVideoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    timeLimit: { type: Number, default: 2000 },
    memoryLimit: { type: Number, default: 256 },
    starterCodes: {
      cpp: { type: String, default: '' },
      java: { type: String, default: '' },
      python: { type: String, default: '' },
    },
    editorialMarkdown: { type: String },
    editorialVideoUrl: { type: String },
  },
  { timestamps: true }
);

export const Problem = model<IProblem>('Problem', ProblemSchema);
