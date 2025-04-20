import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('Integration Tests', () => {
  test('App renders without crashing and contains expected elements', () => {
    render(<App />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
  });
});