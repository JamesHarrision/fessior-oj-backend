import React, { useState, useEffect } from 'react';
import { OpponentStatus } from '../components/editor/OpponentStatus';
import { ProblemDescription } from '../components/editor/ProblemDescription';
import { CodeEditorPane } from '../components/editor/CodeEditorPane';
import { ConsolePane } from '../components/editor/ConsolePane';
import './SoloEditorView.css';

interface SoloEditorViewProps {
  activeMatch?: any;
}

export const SoloEditorView: React.FC<SoloEditorViewProps> = ({ activeMatch }) => {
  console.log('Active match data:', activeMatch);
  const [code, setCode] = useState(`/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
    
};`);
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdict, setVerdict] = useState('');
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);

  // Simulate opponent activity
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpponentSubmitted(true);
    }, 15000); // Opponent submits after 15 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleRun = () => {
    setIsRunning(true);
    setVerdict('');
    setTimeout(() => {
      setIsRunning(false);
      setVerdict('ACCEPTED');
    }, 1500);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setVerdict('');
    setTimeout(() => {
      setIsSubmitting(false);
      // If code textarea contains return statement, return ACCEPTED, else WA
      if (code.includes('return')) {
        setVerdict('ACCEPTED');
      } else {
        setVerdict('WA');
      }
    }, 2500);
  };

  return (
    <div className="solo-editor-view">
      <div className="status-row">
        <OpponentStatus
          opponentName="Bảy gạo bạc"
          opponentAvatar="https://api.dicebear.com/7.x/adventurer/svg?seed=BayGao"
          isSubmitted={opponentSubmitted}
          timeLeftSeconds={957} // 15 mins 57s
        />
      </div>

      <div className="editor-main-layout">
        <div className="left-column">
          <ProblemDescription />
        </div>
        
        <div className="right-column">
          <CodeEditorPane
            code={code}
            onChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
          />
          
          <ConsolePane
            onRun={handleRun}
            onSubmit={handleSubmit}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            verdict={verdict}
          />
        </div>
      </div>
    </div>
  );
};
