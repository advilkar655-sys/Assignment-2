import { render, screen, fireEvent } from '@testing-library/react';
import { QuizModule } from './QuizModule';
import { describe, it, expect } from 'vitest';

describe('QuizModule', () => {
  it('renders the quiz header', () => {
    render(<QuizModule />);
    expect(screen.getByText('Knowledge Quiz')).toBeInTheDocument();
  });

  it('allows selecting an option and checking the answer', () => {
    render(<QuizModule />);
    const option = screen.getByText('For political parties to select their candidates');
    fireEvent.click(option);
    
    expect(screen.getByText('Correct!')).toBeInTheDocument();
  });
});
