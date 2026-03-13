import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('Footer', () => {
  test('renders Footer component', () => {
    render(<Footer />);
    expect(screen.getByText(/COOLBROS/i)).toBeInTheDocument();
  });

  test('displays brand description', () => {
    render(<Footer />);
    expect(screen.getByText(/Fresh fits for everyone/i)).toBeInTheDocument();
  });

  test('displays shop section', () => {
    render(<Footer />);
    expect(screen.getByText(/Shop/i)).toBeInTheDocument();
    expect(screen.getByText(/All Products/i)).toBeInTheDocument();
  });

  test('displays help section', () => {
    render(<Footer />);
    expect(screen.getByText(/Help/i)).toBeInTheDocument();
    expect(screen.getByText(/My Account/i)).toBeInTheDocument();
  });

  test('displays current year in copyright', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear}`, 'i'))).toBeInTheDocument();
  });
});
