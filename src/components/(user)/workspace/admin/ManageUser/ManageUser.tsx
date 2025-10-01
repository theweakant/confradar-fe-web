"use client";

import { useState } from "react";
import {  
  Plus, 
  Pencil, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Calendar,
  Shield
} from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ActionButton } from "@/components/atoms/ActionButton";
import { StatusBadge } from "@/components/atoms/StatusBadge";

import { SearchBar } from "@/components/molecules/SearchBar";
import { FormInput } from "@/components/molecules/FormInput";
import { Modal } from "@/components/molecules/Modal";


type UserFormData = Omit<User, "id" | "registeredConferences" | "joinedDate">;


// ============================================
// 🔄 REUSABLE: FormSelect Component
// Có thể tái sử dụng cho các form khác
// ============================================
interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
}

function FormSelect({ label, name, value, onChange, options, required = false, error }: FormSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">Chọn {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ============================================
// USER FORM COMPONENT
// ============================================
// Input Handler Types
type ValidationRule = {
  validate: (value: string) => boolean;
  message: string;
};

type FieldValidation = {
  [key: string]: ValidationRule[];
};

interface UserFormProps {
  user?: User | null;
  onSave: (data: UserFormData) => void;
  onCancel: () => void;
}

function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "attendee",
    status: user?.status || "active"
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [touched, setTouched] = useState<Set<keyof UserFormData>>(new Set());

  // Validation rules for each field
  const validationRules: FieldValidation = {
    name: [
      {
        validate: (value) => value.trim().length > 0,
        message: "Tên người dùng là bắt buộc"
      },
      {
        validate: (value) => value.trim().length >= 2,
        message: "Tên phải có ít nhất 2 ký tự"
      }
    ],
    email: [
      {
        validate: (value) => value.trim().length > 0,
        message: "Email là bắt buộc"
      },
      {
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Email không hợp lệ"
      }
    ],
    role: [
      {
        validate: (value) => value.trim().length > 0,
        message: "Vai trò là bắt buộc"
      }
    ],
    status: [
      {
        validate: (value) => value.trim().length > 0,
        message: "Trạng thái là bắt buộc"
      }
    ]
  };

  // Generic input handler
  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
    setTouched(prev => new Set(prev).add(field));
  };

  // Validate a single field
  const validateField = (field: keyof UserFormData, value: string): boolean => {
    const fieldRules = validationRules[field];
    if (!fieldRules) return true;

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        setErrors(prev => ({ ...prev, [field]: rule.message }));
        return false;
      }
    }

    setErrors(prev => ({ ...prev, [field]: "" }));
    return true;
  };

  // Validate all fields
  const validate = (): boolean => {
    let isValid = true;
    const allFields = Object.keys(formData) as Array<keyof UserFormData>;
    
    allFields.forEach(field => {
      const fieldValue = formData[field];
      const fieldIsValid = validateField(field, fieldValue);
      if (!fieldIsValid) {
        isValid = false;
        setTouched(prev => new Set(prev).add(field));
      }
    });

    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "organizer", label: "Organizer" },
    { value: "attendee", label: "Attendee" }
  ];

  const statusOptions = [
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" }
  ];

  return (
    <div className="space-y-4">
      <FormInput
        label="Tên người dùng"
        name="name"
        value={formData.name}
        onChange={(value) => handleChange("name", value)}
        onBlur={() => validateField("name", formData.name)}
        required
        error={touched.has("name") ? errors.name : undefined}
        success={touched.has("name") && !errors.name}
      />

      <FormInput
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={(value) => handleChange("email", value)}
        onBlur={() => validateField("email", formData.email)}
        required
        error={touched.has("email") ? errors.email : undefined}
        success={touched.has("email") && !errors.email}
      />

      <FormSelect
        label="Vai trò"
        name="role"
        value={formData.role}
        onChange={(value) => handleChange("role", value as any)}
        options={roleOptions}
        required
        error={errors.role}
      />

      <FormSelect
        label="Trạng thái"
        name="status"
        value={formData.status}
        onChange={(value) => handleChange("status", value as any)}
        options={statusOptions}
        required
        error={errors.status}
      />

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {user ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ManageUser() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Nguyễn Văn An",
      email: "an.nguyen@example.com",
      role: "admin",
      status: "active",
      registeredConferences: 5,
      joinedDate: "2024-01-15"
    },
    {
      id: "2",
      name: "Trần Thị Bình",
      email: "binh.tran@example.com",
      role: "organizer",
      status: "active",
      registeredConferences: 12,
      joinedDate: "2024-02-20"
    },
    {
      id: "3",
      name: "Lê Hoàng Cường",
      email: "cuong.le@example.com",
      role: "attendee",
      status: "active",
      registeredConferences: 8,
      joinedDate: "2024-03-10"
    },
    {
      id: "4",
      name: "Phạm Thị Dung",
      email: "dung.pham@example.com",
      role: "attendee",
      status: "inactive",
      registeredConferences: 2,
      joinedDate: "2024-04-05"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSave = (data: UserFormData) => {
    if (editingUser) {
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...data }
          : u
      ));
      showNotification("Cập nhật người dùng thành công!", "success");
    } else {
      const newUser: User = {
        ...data,
        id: Date.now().toString(),
        registeredConferences: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
      showNotification("Thêm người dùng thành công!", "success");
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    setDeleteUserId(id);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      setUsers(prev => prev.filter(u => u.id !== deleteUserId));
      showNotification("Xóa người dùng thành công!", "success");
      setDeleteUserId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "admin") return <Shield className="w-4 h-4" />;
    return null;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Admin",
      organizer: "Organizer",
      attendee: "Attendee"
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Người dùng</h1>
          <p className="text-gray-600">Quản lý thông tin người dùng ConfRadar</p>
        </div>

        {notification && (
          <Alert className={`mb-6 ${notification.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <AlertDescription className={notification.type === "success" ? "text-green-800" : "text-red-800"}>
              {notification.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm theo tên hoặc email..."
            />
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="organizer">Organizer</option>
              <option value="attendee">Attendee</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>

            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Thêm người dùng
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng người dùng</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <UserCheck className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.status === "active").length}
                </p>
              </div>
              <UserCheck className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Không hoạt động</p>
                <p className="text-3xl font-bold text-red-600">
                  {users.filter(u => u.status === "inactive").length}
                </p>
              </div>
              <UserX className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Admin</p>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(u => u.role === "admin").length}
                </p>
              </div>
              <Shield className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Người dùng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vai trò</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Đăng ký</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày tham gia</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className="text-gray-900">{getRoleLabel(user.role)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                          variant={user.status === "active" ? "success" : "danger"}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">
                          {user.registeredConferences} hội thảo
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.joinedDate).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <ActionButton
                            onClick={() => handleEdit(user)}
                            icon={<Pencil className="w-4 h-4" />}
                            variant="primary"
                            tooltip="Chỉnh sửa"
                          />
                          <ActionButton
                            onClick={() => handleDelete(user.id)}
                            icon={<Trash2 className="w-4 h-4" />}
                            variant="danger"
                            tooltip="Xóa"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      >
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
        />
      </Modal>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}