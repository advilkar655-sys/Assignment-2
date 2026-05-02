import React, { useState } from 'react';

type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'What is the primary purpose of a primary election or caucus in the US?',
    options: [
      'To officially elect the President',
      'For political parties to select their candidates',
      'To register citizens to vote',
      'To pass new voting laws'
    ],
    correctAnswerIndex: 1,
    explanation: 'Primaries and caucuses are early stages where voters decide who will represent their political party in the general election.'
  },
  {
    id: 'q2',
    text: 'In the Indian electoral system, what does EVM stand for?',
    options: [
      'Electoral Vote Machine',
      'Electronic Voting Machine',
      'Early Voting Method',
      'Election Verification Measure'
    ],
    correctAnswerIndex: 1,
    explanation: 'EVM stands for Electronic Voting Machine, which is widely used in Indian elections for casting and counting votes efficiently.'
  }
];

export const QuizModule: React.FC = React.memo(() => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const question = QUIZ_QUESTIONS[currentQuestionIdx];

  const handleSelectOption = (index: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer
    
    setSelectedAnswer(index);
    if (index === question.correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(idx => idx + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  if (showResult) {
    return (
      <div className="quiz-module glass-panel animate-fade-in">
        <h3>Quiz Complete!</h3>
        <p className="score-text">You scored {score} out of {QUIZ_QUESTIONS.length}</p>
        <button className="btn btn-primary mt-2" onClick={handleRestart}>
          Restart Quiz
        </button>
      </div>
    );
  }

  const isCorrect = selectedAnswer === question.correctAnswerIndex;

  return (
    <div className="quiz-module glass-panel">
       <div className="quiz-header">
          <h3>Knowledge Quiz</h3>
          <span className="quiz-progress">Question {currentQuestionIdx + 1} of {QUIZ_QUESTIONS.length}</span>
       </div>
       
       <div className="quiz-body">
          <p className="question-text">{question.text}</p>
          
          <div className="quiz-options">
             {question.options.map((opt, idx) => {
               let btnClass = "btn btn-glass option-btn";
               if (selectedAnswer !== null) {
                  if (idx === question.correctAnswerIndex) {
                     btnClass += " correct";
                  } else if (idx === selectedAnswer) {
                     btnClass += " incorrect";
                  } else {
                     btnClass += " disabled";
                  }
               }

               return (
                 <button 
                   key={idx} 
                   className={btnClass}
                   onClick={() => handleSelectOption(idx)}
                   disabled={selectedAnswer !== null}
                   aria-pressed={selectedAnswer === idx}
                 >
                   {opt}
                 </button>
               );
             })}
          </div>

          {selectedAnswer !== null && (
             <div className={`quiz-feedback animate-fade-in ${isCorrect ? 'text-success' : 'text-error'}`}>
                <h4>{isCorrect ? 'Correct!' : 'Incorrect'}</h4>
                <p>{question.explanation}</p>
                <button className="btn btn-primary mt-2" onClick={handleNext}>
                   {currentQuestionIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}
                </button>
             </div>
          )}
       </div>
    </div>
  );
});
