// RegisterPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { useRouter } from 'next/navigation';
import Register from '@/app/auth/register/page';
import { store } from '@/redux/store';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/redux/services/auth.service', () => ({
  useRegisterMutation: () => [
    jest.fn(),
    { isLoading: false, isSuccess: false, isError: false },
  ],
}));

// Helper function to render with Redux Provider
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Register Page - Test Cases', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  // REG-TC01: Verify that registration form displays correctly
  describe('REG-TC01: Form Display', () => {
    it('should display registration form with all required fields and labels', () => {
      renderWithProviders(<Register />);

      // Verify page title
      expect(screen.getByText('Tham Gia Cộng Đồng ConfRadar')).toBeInTheDocument();

      // Verify all form fields are visible
      expect(screen.getByLabelText(/Họ và tên/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mật Khẩu/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nhập lại mật khẩu/i)).toBeInTheDocument();
      expect(screen.getByText('Giới Tính')).toBeInTheDocument();
      expect(screen.getByText('Ngày Sinh')).toBeInTheDocument();
      expect(screen.getByLabelText(/Số Điện Thoại/i)).toBeInTheDocument();

      // Verify avatar upload section
      expect(screen.getByText(/Ảnh đại diện/i)).toBeInTheDocument();
      expect(screen.getByText('Chọn ảnh')).toBeInTheDocument();

      // Verify required field asterisks (*)
      const requiredFields = screen.getAllByText('*');
      expect(requiredFields.length).toBeGreaterThanOrEqual(4); // fullName, email, password, confirmPassword

      // Verify submit button
      expect(screen.getByRole('button', { name: /Đăng Ký/i })).toBeInTheDocument();

      // Verify login link
      expect(screen.getByText(/Đã có tài khoản?/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument();
    });
  });

  // REG-TC02: Verify successful registration with required fields only
  describe('REG-TC02: Successful Registration - Required Fields', () => {
    it('should register successfully with all required fields filled', async () => {
      const user = userEvent.setup();
      const mockRegisterUser = jest.fn().mockResolvedValue({ unwrap: () => Promise.resolve() });

      // Mock useRegisterMutation to return our mock function
      jest.spyOn(require('@/redux/services/auth.service'), 'useRegisterMutation')
        .mockReturnValue([mockRegisterUser, { isLoading: false }]);

      renderWithProviders(<Register />);

      // Fill required fields
      await user.type(screen.getByLabelText(/Họ và tên/i), 'Nguyen Van A');
      await user.type(screen.getByLabelText(/Email/i), 'test01@example.com');
      await user.type(screen.getByLabelText(/^Mật Khẩu/i), 'Test@123456');
      await user.type(screen.getByLabelText(/Nhập lại mật khẩu/i), 'Test@123456');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Đăng Ký/i });
      await user.click(submitButton);

      // Verify loading state
      await waitFor(() => {
        expect(screen.getByText(/Đang Tạo Tài Khoản.../i)).toBeInTheDocument();
      });

      // Verify success toast and redirect
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Đăng ký thành công. Vui lòng kiểm tra Mail của bạn!');
        expect(mockPush).toHaveBeenCalledWith('/auth/login');
      });
    });
  });

  // REG-TC04: Verify validation for empty required fields
  describe('REG-TC04: Empty Required Fields Validation', () => {
    it('should prevent form submission with empty required fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const submitButton = screen.getByRole('button', { name: /Đăng Ký/i });

      // Try to submit empty form
      await user.click(submitButton);

      // HTML5 validation should prevent submission
      const fullNameInput = screen.getByLabelText(/Họ và tên/i) as HTMLInputElement;
      expect(fullNameInput.validity.valid).toBe(false);
      expect(fullNameInput.validity.valueMissing).toBe(true);

      // Verify no redirect occurred
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // REG-TC05: Verify email format validation
  describe('REG-TC05: Invalid Email Format Validation', () => {
    it('should show validation error for invalid email format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;

      // Enter invalid email
      await user.type(emailInput, 'invalidemail.com');

      // Check HTML5 validation
      expect(emailInput.validity.valid).toBe(false);
      expect(emailInput.validity.typeMismatch).toBe(true);

      // Fill other required fields
      await user.type(screen.getByLabelText(/Họ và tên/i), 'Test User');
      await user.type(screen.getByLabelText(/^Mật Khẩu/i), 'Test@123456');
      await user.type(screen.getByLabelText(/Nhập lại mật khẩu/i), 'Test@123456');

      // Try to submit
      const submitButton = screen.getByRole('button', { name: /Đăng Ký/i });
      await user.click(submitButton);

      // Verify form did not submit
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // REG-TC06: Verify password mismatch validation
  describe('REG-TC06: Password Mismatch Validation', () => {
    it('should show error toast when passwords do not match', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      // Fill form with mismatched passwords
      await user.type(screen.getByLabelText(/Họ và tên/i), 'Test User');
      await user.type(screen.getByLabelText(/Email/i), 'test03@example.com');
      await user.type(screen.getByLabelText(/^Mật Khẩu/i), 'Test@123456');
      await user.type(screen.getByLabelText(/Nhập lại mật khẩu/i), 'DifferentPass@123');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Đăng Ký/i });
      await user.click(submitButton);

      // Verify error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Mật khẩu xác nhận không khớp');
      });

      // Verify no redirect
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // REG-TC07: Verify duplicate email error
  describe('REG-TC07: Duplicate Email Error', () => {
    it('should show error when email already exists', async () => {
      const user = userEvent.setup();
      const mockRegisterUser = jest.fn().mockRejectedValue(new Error('Email already exists'));

      jest.spyOn(require('@/redux/services/auth.service'), 'useRegisterMutation')
        .mockReturnValue([mockRegisterUser, { isLoading: false }]);

      renderWithProviders(<Register />);

      // Fill form with existing email
      await user.type(screen.getByLabelText(/Họ và tên/i), 'Test User');
      await user.type(screen.getByLabelText(/Email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^Mật Khẩu/i), 'Test@123456');
      await user.type(screen.getByLabelText(/Nhập lại mật khẩu/i), 'Test@123456');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Đăng Ký/i });
      await user.click(submitButton);

      // Verify error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Đăng ký thất bại. Vui lòng thử lại!');
      });

      // Verify user stays on registration page
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // REG-TC08: Verify valid avatar upload
  describe('REG-TC08: Valid Avatar Upload', () => {
    it('should display avatar preview when valid image is selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      // Create mock image file
      const file = new File(['dummy content'], 'test-avatar.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 }); // 2MB

      const fileInput = screen.getByLabelText(/Chọn ảnh/i) as HTMLInputElement;

      // Upload file
      await user.upload(fileInput, file);

      // Verify preview displays
      await waitFor(() => {
        const avatarImage = screen.getByAltText('Avatar preview');
        expect(avatarImage).toBeInTheDocument();
      });

      // Verify button text changes
      expect(screen.getByText('Thay đổi ảnh')).toBeInTheDocument();

      // Verify remove button appears
      const removeButton = screen.getByRole('button', { name: '' }); // X button
      expect(removeButton).toBeInTheDocument();
    });
  });

  // REG-TC09: Verify file size validation
  describe('REG-TC09: Avatar File Size Validation', () => {
    it('should show error when avatar file exceeds 5MB', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      // Create mock large file (6MB)
      const largeFile = new File(['dummy content'], 'large-image.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }); // 6MB

      const fileInput = screen.getByLabelText(/Chọn ảnh/i) as HTMLInputElement;

      // Try to upload large file
      await user.upload(fileInput, largeFile);

      // Verify error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Kích thước ảnh không được vượt quá 5MB');
      });

      // Verify preview does not display
      expect(screen.queryByAltText('Avatar preview')).not.toBeInTheDocument();
    });
  });

  // REG-TC10: Verify non-image file validation
  describe('REG-TC10: Non-Image File Validation', () => {
    it('should show error when non-image file is selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      // Create mock PDF file
      const pdfFile = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });

      const fileInput = screen.getByLabelText(/Chọn ảnh/i) as HTMLInputElement;

      // Try to upload PDF file
      await user.upload(fileInput, pdfFile);

      // Verify error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Vui lòng chọn file ảnh');
      });

      // Verify preview does not display
      expect(screen.queryByAltText('Avatar preview')).not.toBeInTheDocument();
    });
  });

  // REG-TC11: Verify login link navigation
  describe('REG-TC11: Login Link Navigation', () => {
    it('should redirect to login page when clicking login link', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      // Find and click login link
      const loginLink = screen.getByRole('button', { name: /Đăng nhập/i });
      expect(loginLink).toBeInTheDocument();

      await user.click(loginLink);

      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  // REG-TC12: Verify loading state during submission
  describe('REG-TC12: Loading State During Submission', () => {
    it('should disable form controls during registration', async () => {
      const user = userEvent.setup();

      // Mock slow API call
      const mockRegisterUser = jest.fn(() => ({
        unwrap: () => new Promise((resolve) => setTimeout(resolve, 2000))
      }));

      jest.spyOn(require('@/redux/services/auth.service'), 'useRegisterMutation')
        .mockReturnValue([mockRegisterUser, { isLoading: false }]);

      renderWithProviders(<Register />);

      // Fill form
      await user.type(screen.getByLabelText(/Họ và tên/i), 'Test User');
      await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^Mật Khẩu/i), 'Test@123456');
      await user.type(screen.getByLabelText(/Nhập lại mật khẩu/i), 'Test@123456');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Đăng Ký/i });
      await user.click(submitButton);

      // Verify loading state
      await waitFor(() => {
        expect(screen.getByText(/Đang Tạo Tài Khoản.../i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Đang Tạo Tài Khoản.../i })).toBeDisabled();
      });

      // Verify spinner icon
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      // Verify form inputs are disabled
      expect(screen.getByLabelText(/Họ và tên/i)).toBeDisabled();
      expect(screen.getByLabelText(/Email/i)).toBeDisabled();
    });
  });

  // Additional Test: Verify avatar removal
  describe('Additional: Avatar Removal', () => {
    it('should remove avatar preview when X button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      // Upload image first
      const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1 * 1024 * 1024 });

      const fileInput = screen.getByLabelText(/Chọn ảnh/i) as HTMLInputElement;
      await user.upload(fileInput, file);

      // Verify preview appears
      await waitFor(() => {
        expect(screen.getByAltText('Avatar preview')).toBeInTheDocument();
      });

      // Find and click remove button
      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find(btn => btn.querySelector('.w-3.h-3'));

      if (removeButton) {
        await user.click(removeButton);

        // Verify preview is removed
        await waitFor(() => {
          expect(screen.queryByAltText('Avatar preview')).not.toBeInTheDocument();
        });

        // Verify button text resets
        expect(screen.getByText('Chọn ảnh')).toBeInTheDocument();
      }
    });
  });

  // Additional Test: Verify gender selection
  describe('Additional: Gender Selection', () => {
    it('should allow user to select gender from dropdown', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      // Open gender dropdown
      const genderSelect = screen.getByRole('combobox');
      await user.click(genderSelect);

      // Select "Nam"
      await waitFor(() => {
        const maleOption = screen.getByText('Nam');
        expect(maleOption).toBeInTheDocument();
      });

      await user.click(screen.getByText('Nam'));

      // Verify selection
      expect(genderSelect).toHaveTextContent('Nam');
    });
  });
});