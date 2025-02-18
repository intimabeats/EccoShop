import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import { ProductCard } from './ProductCard';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 1000, // R$ 10,00
  imageUrl: 'test.jpg',
  stock: 5,
  category: 'test',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('R$ 10,00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument();
  });

  it('calls onAddToCart when add button is clicked', () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('disables add button when stock is 0', () => {
    const onAddToCart = vi.fn();
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} onAddToCart={onAddToCart} />);

    const button = screen.getByRole('button', { name: /esgotado/i });
    expect(button).toBeDisabled();
  });

  it('shows loading skeleton when loading prop is true', () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} loading />);

    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });
});
