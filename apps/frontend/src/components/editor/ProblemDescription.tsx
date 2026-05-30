import React from 'react';
import { BookOpen } from 'lucide-react';
import './ProblemDescription.css';

export const ProblemDescription: React.FC = () => {
  return (
    <div className="problem-description glass-card">
      <div className="desc-header">
        <BookOpen size={16} className="desc-icon" />
        <span>Description</span>
      </div>

      <div className="desc-content">
        <h1 className="problem-title">1. Two Sum</h1>
        
        <div className="badge-row">
          <span className="badge difficulty easy">Easy</span>
          <span className="badge tag">Array</span>
          <span className="badge tag">Hash Table</span>
        </div>

        <div className="problem-text">
          <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.</p>
          <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
          <p>You can return the answer in any order.</p>
        </div>

        <div className="example-box">
          <h3>Example 1:</h3>
          <pre className="example-pre">
{`Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`}
          </pre>
        </div>

        <div className="example-box">
          <h3>Example 2:</h3>
          <pre className="example-pre">
{`Input: nums = [3,2,4], target = 6
Output: [1,2]`}
          </pre>
        </div>
      </div>
    </div>
  );
};
