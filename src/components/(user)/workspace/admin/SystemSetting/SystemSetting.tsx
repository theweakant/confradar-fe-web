"use client";

import React, { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Zap,
  Users,
  Search,
  Save,
  RotateCcw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// 🔄 REUSABLE: SettingSection - Component wrapper cho mỗi section cấu hình
interface SettingSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingSection({
  icon,
  title,
  description,
  children,
}: SettingSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="text-blue-600">{icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

// 🔄 REUSABLE: SettingItem - Component cho từng mục cấu hình
interface SettingItemProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingItem({ label, description, children }: SettingItemProps) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-4">
        <label className="text-sm font-medium text-gray-700 block">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// 🔄 REUSABLE: ToggleSwitch - Component toggle switch
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? "bg-blue-600" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// 🔄 REUSABLE: SelectInput - Component select dropdown
interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

function SelectInput({ value, onChange, options, disabled }: SelectInputProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// 🔄 REUSABLE: TextInput - Component text input
interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
    />
  );
}

export default function SystemSetting() {
  const [saveAlert, setSaveAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // State cho General Settings
  const [appName, setAppName] = useState("ConfRadar");
  const [appUrl, setAppUrl] = useState("https://confradar.app");
  const [defaultLanguage, setDefaultLanguage] = useState("vi");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");

  // State cho Notification Settings
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [conferenceReminder, setConferenceReminder] = useState(true);
  const [newConferenceAlert, setNewConferenceAlert] = useState(true);
  const [reminderTime, setReminderTime] = useState("24");

  // State cho Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordPolicy, setPasswordPolicy] = useState("medium");
  const [apiRateLimit, setApiRateLimit] = useState("1000");

  // State cho Database Settings
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [retentionDays, setRetentionDays] = useState("30");
  const [dbOptimization, setDbOptimization] = useState(true);

  // State cho Email Settings
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [emailFrom, setEmailFrom] = useState("noreply@confradar.app");

  // State cho Search & Indexing
  const [autoIndex, setAutoIndex] = useState(true);
  const [indexFrequency, setIndexFrequency] = useState("hourly");
  const [searchSuggestion, setSearchSuggestion] = useState(true);
  const [fuzzySearch, setFuzzySearch] = useState(true);

  // State cho API & Integration
  const [apiEnabled, setApiEnabled] = useState(true);
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [corsEnabled, setCorsEnabled] = useState(true);
  const [apiVersion, setApiVersion] = useState("v1");

  // State cho User Management
  const [autoApproval, setAutoApproval] = useState(false);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [accountLockDuration, setAccountLockDuration] = useState("30");

  const handleSave = () => {
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Bạn có chắc muốn khôi phục cấu hình mặc định?")) {
      // Reset logic here
      setSaveAlert(true);
      setTimeout(() => setSaveAlert(false), 3000);
    }
  };

  const tabs = [
    { id: "general", label: "Chung", icon: <Settings className="w-4 h-4" /> },
    {
      id: "notification",
      label: "Thông báo",
      icon: <Bell className="w-4 h-4" />,
    },
    { id: "security", label: "Bảo mật", icon: <Shield className="w-4 h-4" /> },
    {
      id: "database",
      label: "Cơ sở dữ liệu",
      icon: <Database className="w-4 h-4" />,
    },
    { id: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
    { id: "search", label: "Tìm kiếm", icon: <Search className="w-4 h-4" /> },
    { id: "api", label: "API", icon: <Zap className="w-4 h-4" /> },
    { id: "user", label: "Người dùng", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cấu hình Hệ thống
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý cấu hình và thiết lập cho ConfRadar
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Khôi phục mặc định
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {saveAlert && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              ✓ Đã lưu cấu hình thành công!
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {activeTab === "general" && (
            <SettingSection
              icon={<Settings className="w-6 h-6" />}
              title="Cấu hình Chung"
              description="Thiết lập thông tin cơ bản của hệ thống"
            >
              <SettingItem
                label="Tên ứng dụng"
                description="Tên hiển thị của ConfRadar"
              >
                <TextInput
                  value={appName}
                  onChange={setAppName}
                  placeholder="ConfRadar"
                />
              </SettingItem>
              <SettingItem
                label="URL ứng dụng"
                description="Địa chỉ web chính của ứng dụng"
              >
                <TextInput
                  value={appUrl}
                  onChange={setAppUrl}
                  placeholder="https://confradar.app"
                />
              </SettingItem>
              <SettingItem
                label="Ngôn ngữ mặc định"
                description="Ngôn ngữ hiển thị cho người dùng mới"
              >
                <SelectInput
                  value={defaultLanguage}
                  onChange={setDefaultLanguage}
                  options={[
                    { value: "vi", label: "Tiếng Việt" },
                    { value: "en", label: "English" },
                    { value: "ja", label: "日本語" },
                  ]}
                />
              </SettingItem>
              <SettingItem
                label="Múi giờ"
                description="Múi giờ mặc định cho hệ thống"
              >
                <SelectInput
                  value={timezone}
                  onChange={setTimezone}
                  options={[
                    {
                      value: "Asia/Ho_Chi_Minh",
                      label: "Asia/Ho Chi Minh (GMT+7)",
                    },
                    { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
                    {
                      value: "America/New_York",
                      label: "America/New York (GMT-5)",
                    },
                  ]}
                />
              </SettingItem>
            </SettingSection>
          )}

          {activeTab === "notification" && (
            <SettingSection
              icon={<Bell className="w-6 h-6" />}
              title="Cấu hình Thông báo"
              description="Quản lý các loại thông báo và nhắc nhở"
            >
              <SettingItem
                label="Thông báo Email"
                description="Gửi thông báo qua email"
              >
                <ToggleSwitch checked={emailNotif} onChange={setEmailNotif} />
              </SettingItem>
              <SettingItem
                label="Thông báo Push"
                description="Hiển thị thông báo trên trình duyệt"
              >
                <ToggleSwitch checked={pushNotif} onChange={setPushNotif} />
              </SettingItem>
              <SettingItem
                label="Nhắc nhở hội thảo"
                description="Tự động nhắc người dùng trước khi hội thảo diễn ra"
              >
                <ToggleSwitch
                  checked={conferenceReminder}
                  onChange={setConferenceReminder}
                />
              </SettingItem>
              <SettingItem
                label="Thời gian nhắc trước"
                description="Số giờ nhắc trước khi hội thảo bắt đầu"
              >
                <SelectInput
                  value={reminderTime}
                  onChange={setReminderTime}
                  options={[
                    { value: "1", label: "1 giờ" },
                    { value: "6", label: "6 giờ" },
                    { value: "24", label: "24 giờ" },
                    { value: "48", label: "48 giờ" },
                  ]}
                  disabled={!conferenceReminder}
                />
              </SettingItem>
              <SettingItem
                label="Thông báo hội thảo mới"
                description="Thông báo khi có hội thảo mới được đăng"
              >
                <ToggleSwitch
                  checked={newConferenceAlert}
                  onChange={setNewConferenceAlert}
                />
              </SettingItem>
            </SettingSection>
          )}

          {activeTab === "security" && (
            <SettingSection
              icon={<Shield className="w-6 h-6" />}
              title="Cấu hình Bảo mật"
              description="Thiết lập các chính sách bảo mật hệ thống"
            >
              <SettingItem
                label="Xác thực 2 yếu tố"
                description="Yêu cầu mã xác thực bổ sung khi đăng nhập"
              >
                <ToggleSwitch
                  checked={twoFactorAuth}
                  onChange={setTwoFactorAuth}
                />
              </SettingItem>
              <SettingItem
                label="Thời gian hết phiên"
                description="Phút không hoạt động trước khi đăng xuất tự động"
              >
                <SelectInput
                  value={sessionTimeout}
                  onChange={setSessionTimeout}
                  options={[
                    { value: "15", label: "15 phút" },
                    { value: "30", label: "30 phút" },
                    { value: "60", label: "60 phút" },
                    { value: "120", label: "120 phút" },
                  ]}
                />
              </SettingItem>
              <SettingItem
                label="Chính sách mật khẩu"
                description="Độ mạnh yêu cầu cho mật khẩu"
              >
                <SelectInput
                  value={passwordPolicy}
                  onChange={setPasswordPolicy}
                  options={[
                    { value: "low", label: "Thấp (8 ký tự)" },
                    { value: "medium", label: "Trung bình (10 ký tự + số)" },
                    {
                      value: "high",
                      label: "Cao (12 ký tự + số + ký tự đặc biệt)",
                    },
                  ]}
                />
              </SettingItem>
              <SettingItem
                label="Giới hạn API"
                description="Số request tối đa mỗi giờ"
              >
                <TextInput
                  value={apiRateLimit}
                  onChange={setApiRateLimit}
                  placeholder="1000"
                  type="number"
                />
              </SettingItem>
            </SettingSection>
          )}

          {activeTab === "database" && (
            <SettingSection
              icon={<Database className="w-6 h-6" />}
              title="Cấu hình Cơ sở dữ liệu"
              description="Quản lý sao lưu và tối ưu hóa database"
            >
              <SettingItem
                label="Tự động sao lưu"
                description="Tự động sao lưu dữ liệu theo lịch"
              >
                <ToggleSwitch checked={autoBackup} onChange={setAutoBackup} />
              </SettingItem>
              <SettingItem
                label="Tần suất sao lưu"
                description="Chu kỳ thực hiện sao lưu"
              >
                <SelectInput
                  value={backupFrequency}
                  onChange={setBackupFrequency}
                  options={[
                    { value: "hourly", label: "Mỗi giờ" },
                    { value: "daily", label: "Hàng ngày" },
                    { value: "weekly", label: "Hàng tuần" },
                  ]}
                  disabled={!autoBackup}
                />
              </SettingItem>
              <SettingItem
                label="Thời gian lưu trữ"
                description="Số ngày giữ bản sao lưu"
              >
                <TextInput
                  value={retentionDays}
                  onChange={setRetentionDays}
                  placeholder="30"
                  type="number"
                />
              </SettingItem>
              <SettingItem
                label="Tối ưu hóa tự động"
                description="Tự động tối ưu và dọn dẹp database"
              >
                <ToggleSwitch
                  checked={dbOptimization}
                  onChange={setDbOptimization}
                />
              </SettingItem>
            </SettingSection>
          )}

          {activeTab === "email" && (
            <SettingSection
              icon={<Mail className="w-6 h-6" />}
              title="Cấu hình Email"
              description="Thiết lập máy chủ email và thông tin gửi"
            >
              <SettingItem
                label="SMTP Host"
                description="Địa chỉ máy chủ email"
              >
                <TextInput
                  value={smtpHost}
                  onChange={setSmtpHost}
                  placeholder="smtp.gmail.com"
                />
              </SettingItem>
              <SettingItem label="SMTP Port" description="Cổng kết nối SMTP">
                <TextInput
                  value={smtpPort}
                  onChange={setSmtpPort}
                  placeholder="587"
                  type="number"
                />
              </SettingItem>
              <SettingItem
                label="SMTP Username"
                description="Tài khoản đăng nhập SMTP"
              >
                <TextInput
                  value={smtpUser}
                  onChange={setSmtpUser}
                  placeholder="user@example.com"
                />
              </SettingItem>
              <SettingItem
                label="Email người gửi"
                description="Địa chỉ email hiển thị khi gửi"
              >
                <TextInput
                  value={emailFrom}
                  onChange={setEmailFrom}
                  placeholder="noreply@confradar.app"
                />
              </SettingItem>
            </SettingSection>
          )}

          {activeTab === "search" && (
            <SettingSection
              icon={<Search className="w-6 h-6" />}
              title="Cấu hình Tìm kiếm"
              description="Tối ưu hóa công cụ tìm kiếm và đánh index"
            >
              <SettingItem
                label="Tự động đánh index"
                description="Tự động cập nhật index khi có thay đổi"
              >
                <ToggleSwitch checked={autoIndex} onChange={setAutoIndex} />
              </SettingItem>
              <SettingItem
                label="Tần suất đánh index"
                description="Chu kỳ cập nhật index"
              >
                <SelectInput
                  value={indexFrequency}
                  onChange={setIndexFrequency}
                  options={[
                    { value: "realtime", label: "Thời gian thực" },
                    { value: "hourly", label: "Mỗi giờ" },
                    { value: "daily", label: "Hàng ngày" },
                  ]}
                  disabled={!autoIndex}
                />
              </SettingItem>
              <SettingItem
                label="Gợi ý tìm kiếm"
                description="Hiển thị gợi ý khi người dùng nhập"
              >
                <ToggleSwitch
                  checked={searchSuggestion}
                  onChange={setSearchSuggestion}
                />
              </SettingItem>
              <SettingItem
                label="Tìm kiếm mờ"
                description="Cho phép tìm kiếm với lỗi chính tả"
              >
                <ToggleSwitch checked={fuzzySearch} onChange={setFuzzySearch} />
              </SettingItem>
            </SettingSection>
          )}

          {activeTab === "api" && (
            <SettingSection
              icon={<Zap className="w-6 h-6" />}
              title="Cấu hình API & Tích hợp"
              description="Quản lý API và các tích hợp bên ngoài"
            >
              <SettingItem
                label="Kích hoạt API"
                description="Cho phép truy cập API công khai"
              >
                <ToggleSwitch checked={apiEnabled} onChange={setApiEnabled} />
              </SettingItem>
              <SettingItem
                label="Phiên bản API"
                description="Phiên bản API hiện tại"
              >
                <SelectInput
                  value={apiVersion}
                  onChange={setApiVersion}
                  options={[
                    { value: "v1", label: "v1" },
                    { value: "v2", label: "v2 (Beta)" },
                  ]}
                  disabled={!apiEnabled}
                />
              </SettingItem>
              <SettingItem
                label="Webhook"
                description="Cho phép gửi sự kiện qua webhook"
              >
                <ToggleSwitch
                  checked={webhookEnabled}
                  onChange={setWebhookEnabled}
                />
              </SettingItem>
              <SettingItem
                label="CORS"
                description="Cho phép truy cập từ domain khác"
              >
                <ToggleSwitch checked={corsEnabled} onChange={setCorsEnabled} />
              </SettingItem>
            </SettingSection>
          )}

          {activeTab === "user" && (
            <SettingSection
              icon={<Users className="w-6 h-6" />}
              title="Cấu hình Quản lý Người dùng"
              description="Thiết lập chính sách và hành vi người dùng"
            >
              <SettingItem
                label="Tự động phê duyệt"
                description="Tự động kích hoạt tài khoản mới đăng ký"
              >
                <ToggleSwitch
                  checked={autoApproval}
                  onChange={setAutoApproval}
                />
              </SettingItem>
              <SettingItem
                label="Số lần đăng nhập sai"
                description="Số lần cho phép nhập sai mật khẩu"
              >
                <TextInput
                  value={maxLoginAttempts}
                  onChange={setMaxLoginAttempts}
                  placeholder="5"
                  type="number"
                />
              </SettingItem>
              <SettingItem
                label="Thời gian khóa tài khoản"
                description="Phút khóa tài khoản khi đăng nhập sai quá nhiều"
              >
                <TextInput
                  value={accountLockDuration}
                  onChange={setAccountLockDuration}
                  placeholder="30"
                  type="number"
                />
              </SettingItem>
            </SettingSection>
          )}
        </div>
      </div>
    </div>
  );
}
