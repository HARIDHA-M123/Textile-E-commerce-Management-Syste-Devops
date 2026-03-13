import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';

// Mock Auth Context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoggedIn: false,
  }),
}));

// Mock Cart Context
jest.mock('../../context/CartContext', () => ({
  useCart: () => ({
    cartCount: 0,
  }),
}));

// Mock Wishlist Context
jest.mock('../../context/WishlistContext', () => ({
  useWishlist: () => ({
    wishlistCount: 0,
  }),
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  test('renders Navbar component', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/COOLBROS/i)).toBeInTheDocument();
  });

  test('displays navigation links', () => {
    renderWithRouter(<Navbar />);
    // Check for desktop navigation links (they have specific class)
    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Home/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Shop/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/About/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Contact/i)[0]).toBeInTheDocument();
  });

  test('displays announcement bar', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/Free shipping/i)).toBeInTheDocument();
  });
});
