import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Register from '@/components/(auth)/Register';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock register mutation
const mockRegisterUser = jest.fn();
jest.mock('@/redux/services/auth.service', () => ({
  useRegisterMutation: () => [mockRegisterUser, { isLoading: false }],
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: () => ({}),
    },
  });
};

describe('Register Component', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
  });

  test('renders main title', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    expect(screen.getByText('Tham Gia Cộng Đồng ConfRadar')).toBeInTheDocument();
  });

  test('renders subtitle', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    expect(screen.getByText('Khám phá các hội nghị và hội thảo hàng đầu')).toBeInTheDocument();
  });

  test('renders right side image section', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    expect(screen.getByText('Kết Nối Với Các Chuyên Gia Hàng Đầu')).toBeInTheDocument();
    expect(screen.getByText(/Tham gia cộng đồng ConfRadar/)).toBeInTheDocument();
  });

  test('renders all form fields', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    expect(screen.getByText(/Họ và tên/)).toBeInTheDocument();
    expect(screen.getByText(/^Email/)).toBeInTheDocument();
    expect(screen.getByText(/^Mật Khẩu/)).toBeInTheDocument();
    expect(screen.getByText(/Nhập lại mật khẩu/)).toBeInTheDocument();
    expect(screen.getByText(/Giới Tính/)).toBeInTheDocument();
    expect(screen.getByText(/Ngày Sinh/)).toBeInTheDocument();
    expect(screen.getByText(/Số Điện Thoại/)).toBeInTheDocument();
  });

  test('renders avatar upload section', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    expect(screen.getByText('Ảnh đại diện')).toBeInTheDocument();
    expect(screen.getByText('Chọn ảnh')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG (max 5MB)')).toBeInTheDocument();
  });

  test('renders required field indicators', () => {
    const { container } = render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    const requiredMarks = container.querySelectorAll('.text-destructive');
    expect(requiredMarks.length).toBeGreaterThan(0);
  });

  test('renders submit button', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /Đăng Ký/i })).toBeInTheDocument();
  });

  test('renders login link', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    expect(screen.getByText('Đã có tài khoản?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument();
  });

  test('handles full name input change', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Nhập họ tên') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'John Doe' } });

    expect(input.value).toBe('John Doe');
  });

  test('handles email input change', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    const input = screen.getByPlaceholderText('email@example.com') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(input.value).toBe('test@example.com');
  });

  test('handles password input change', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Tạo mật khẩu') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'password123' } });

    expect(input.value).toBe('password123');
  });

  test('handles confirm password input change', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Nhập lại mật khẩu') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'password123' } });

    expect(input.value).toBe('password123');
  });

  test('handles phone number input change', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Số điện thoại') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '0123456789' } });

    expect(input.value).toBe('0123456789');
  });

  test('handles birthday input change', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    const input = screen.getByLabelText(/Ngày Sinh/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2000-01-01' } });

    expect(input.value).toBe('2000-01-01');
  });

  test('navigates to login page when login link is clicked', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    const loginButton = screen.getByRole('button', { name: /Đăng nhập/i });
    fireEvent.click(loginButton);

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  test('shows error when passwords do not match', async () => {
    const toast = require('sonner').toast;

    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Nhập họ tên'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('email@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Tạo mật khẩu'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập lại mật khẩu'), {
      target: { value: 'different_password' },
    });

    const submitButton = screen.getByRole('button', { name: /Đăng Ký/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Mật khẩu xác nhận không khớp');
    });
  });
});