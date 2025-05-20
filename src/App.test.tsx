import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  const { baseElement } = render(<App />);
  expect(baseElement).toBeDefined();
});

test('shows login button', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
