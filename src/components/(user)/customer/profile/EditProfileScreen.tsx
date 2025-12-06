"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogPanel } from "@headlessui/react";
import {
  UserProfileResponse,
  ProfileUpdateRequest,
  ChangePasswordRequest,
} from "@/types/user.type";
import { Edit, MapPin, X, Lock, CheckCircle, XCircle, Users, Calendar, AlertTriangle } from "lucide-react";
import { useAuth } from "@/redux/hooks/useAuth";
import { useProfile } from "@/redux/hooks/useProfile";
import { useGetOrcidStatusQuery, useLazyAuthorizeOrcidQuery, useLazyGetBiographyQuery, useLazyGetEducationsQuery, useLazyGetWorksQuery } from "@/redux/services/orcid.service";

const EditProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    refetch,
    updateProfile,
    isUpdating,
    updateError,
    changePassword,
    isChanging,
    changePasswordError,
  } = useProfile();

  const { data: orcidStatusData, isLoading: isLoadingOrcidStatus } = useGetOrcidStatusQuery();

  const [triggerAuthorizeOrcid, { data: authorizeData, isFetching }] = useLazyAuthorizeOrcidQuery();

  const [triggerGetWorks, { data: worksData, isLoading: isLoadingWorks }] =
    useLazyGetWorksQuery();
  const [triggerGetBiography, { data: biographyData, isLoading: isLoadingBio }] =
    useLazyGetBiographyQuery();
  const [triggerGetEducations, { data: educationsData, isLoading: isLoadingEdu }] =
    useLazyGetEducationsQuery();

  const orcidStatus = orcidStatusData?.data;
  const isOrcidLinked = orcidStatus?.isLinked || false;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<UserProfileResponse>>({
    fullName: "",
    phoneNumber: "",
    gender: null,
    bioDescription: "",
    birthDay: null,
  });

  const [isChangePassDialogOpen, setIsChangePassDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [tempLocation, setTempLocation] = useState("");
  const [tempBio, setTempBio] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const [activeTab, setActiveTab] = useState<"profile" | "orcid">("profile");

  const calculateCompletion = () => {
    const fields = [
      { value: profile?.fullName, weight: 10 },
      { value: profile?.avatarUrl, weight: 5 },
      { value: profile?.phoneNumber, weight: 10 },
      { value: profile?.bioDescription, weight: 20 },
      { value: profile?.birthDay, weight: 15 },
      { value: profile?.gender, weight: 15 },
      { value: true, weight: 15 },
      { value: false, weight: 10 },
    ];

    const completed = fields.reduce((sum, field) => {
      return sum + (field.value ? field.weight : 0);
    }, 0);

    return completed;
  };

  const completionPercentage = calculateCompletion();

  const formatPublicationDate = (pubDate?: { year?: { value: string }, month?: { value: string }, day?: { value: string } }) => {
    if (!pubDate) return null;
    const parts = [];
    if (pubDate.month?.value) parts.push(pubDate.month.value.padStart(2, '0'));
    if (pubDate.day?.value) parts.push(pubDate.day.value.padStart(2, '0'));
    if (pubDate.year?.value) parts.push(pubDate.year.value);
    return parts.length > 0 ? parts.join('/') : null;
  };

  useEffect(() => {
    if (activeTab === "orcid" && isOrcidLinked) {
      triggerGetWorks();
      triggerGetBiography();
      triggerGetEducations();
    }
  }, [activeTab, isOrcidLinked, triggerGetWorks, triggerGetBiography, triggerGetEducations]);

  useEffect(() => {
    if (profile) {
      setEditFormData({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        gender: profile.gender as "Male" | "Female" | "Other" | null,
        bioDescription: profile.bioDescription || "",
        birthDay: profile.birthDay || null,
      });
      setTempLocation(profile.bioDescription || "");
      setTempBio(profile.bioDescription || "");
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      const changed =
        editFormData.fullName !== (profile.fullName || "") ||
        editFormData.phoneNumber !== (profile.phoneNumber || "") ||
        editFormData.gender !== profile.gender ||
        editFormData.bioDescription !== (profile.bioDescription || "") ||
        editFormData.birthDay !== profile.birthDay ||
        avatarFile !== null;

      setHasUnsavedChanges(changed);
    }
  }, [editFormData, avatarFile, profile]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (field: string, value: string | null) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updateData: ProfileUpdateRequest = {
        fullName: editFormData.fullName || undefined,
        phoneNumber: editFormData.phoneNumber ?? undefined,
        gender: editFormData.gender as "Male" | "Female" | "Other" | undefined,
        bioDescription: editFormData.bioDescription ?? undefined,
        birthDay: editFormData.birthDay ?? undefined,
        avatarFile: avatarFile || undefined,
      };

      await updateProfile(updateData);
      alert("Cập nhật hồ sơ thành công!");
      setIsEditDialogOpen(false);
      setAvatarFile(null);
      setHasUnsavedChanges(false);
    } catch (error: unknown) {
      const errorMessage = "Có lỗi xảy ra khi cập nhật hồ sơ";
      alert(errorMessage);
    }
  };

  const handleSaveLocation = () => {
    handleInputChange("bioDescription", tempLocation);
    setIsEditingLocation(false);
  };

  const handleSaveBio = () => {
    handleInputChange("bioDescription", tempBio);
    setIsEditingBio(false);
  };

  const handlePasswordChange = (
    field: keyof ChangePasswordRequest,
    value: string,
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      await changePassword(passwordData);
      alert("Đổi mật khẩu thành công!");
      setIsChangePassDialogOpen(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error: unknown) {
      const errorMessage = "Có lỗi xảy ra khi đổi mật khẩu";
      alert(errorMessage);
    }
  };

  const handleOrcidLink = async () => {
    try {
      const response = await triggerAuthorizeOrcid().unwrap();
      const link = response?.data;

      if (link) {
        window.location.href = link;
      } else {
        alert("Không thể liên kết ORCID");
      }
    } catch (error) {
      console.error("Error authorizing ORCID:", error);
      alert("Có lỗi xảy ra khi liên kết ORCID");
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Không thể tải hồ sơ</h2>
          <p className="text-gray-600">Vui lòng đăng nhập để xem hồ sơ.</p>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lỗi tải hồ sơ</h2>
          <p className="text-gray-600 mb-4">
            {profileError
              ? "Có lỗi xảy ra khi tải hồ sơ."
              : "Không tìm thấy thông tin hồ sơ."}
          </p>
          <Button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Profile</h1>

          {activeTab === "profile" && (
            <Button
              onClick={() => setIsChangePassDialogOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </Button>
          )}

          {/* Tabs Navigation */}
          <div className="flex gap-2 border-b border-gray-300">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "profile"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Profile & Settings
              {activeTab === "profile" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("orcid")}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "orcid"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              ORCID Information
              {activeTab === "orcid" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>

          {hasUnsavedChanges && activeTab === "profile" && (
            <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-amber-800">
                Bạn có thay đổi chưa được lưu. Nhớ bấm nút &quot;Save Changes&quot; trong dialog để lưu thông tin.
              </p>
            </div>
          )}
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {activeTab === "profile" ? (
            <>
              {/* Tab 1: Profile Content */}
              <section className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-white rounded-2xl p-8 space-y-8 shadow-sm border border-gray-200">
                  {/* Avatar Upload */}
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile.fullName || "Profile"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                            {(profile.fullName || "U").charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 text-gray-900">Upload new photo</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        At least 800×800 px recommended.<br />
                        JPG or PNG is allowed
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium"
                      >
                        Choose file
                      </label>
                      {avatarFile && (
                        <p className="text-green-600 text-sm mt-2">
                          Selected: {avatarFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Personal Info</h3>
                      <button
                        onClick={() => setIsEditDialogOpen(true)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Full Name</Label>
                        <p className="text-gray-900 font-medium">{editFormData.fullName || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Email</Label>
                        <p className="text-gray-900 font-medium">{profile.email || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Phone</Label>
                        <p className="text-gray-900 font-medium">{editFormData.phoneNumber || "Not set"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Bio</h3>
                      <button
                        onClick={() => setIsEditDialogOpen(true)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {editFormData.bioDescription || "No bio added yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Right Sidebar - Progress */}
              <section className="lg:col-span-5">
                <div className="bg-white rounded-2xl p-8 sticky top-6 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-semibold mb-8 text-gray-900">Complete your profile</h3>
                  <div className="flex justify-center mb-8">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="#10b981"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          strokeDashoffset={`${2 * Math.PI * 88 * (1 - completionPercentage / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-900">{completionPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-900">Setup account</span>
                      </div>
                      <span className="text-sm text-gray-600">10%</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        {profile.avatarUrl ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={profile.avatarUrl ? "text-gray-900" : "text-gray-500"}>
                          Upload your photo
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">5%</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        {profile.phoneNumber ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={profile.phoneNumber ? "text-gray-900" : "text-gray-500"}>
                          Personal Info
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">10%</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        {profile.bioDescription ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={profile.bioDescription ? "text-gray-900" : "text-gray-500"}>
                          Biography
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">15%</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-900">Notifications</span>
                      </div>
                      <span className="text-sm text-green-600">+10%</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-500">Bank details</span>
                      </div>
                      <span className="text-sm text-green-600">+30%</span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Tab 2: ORCID Content */}
              <section className="lg:col-span-12">
                <div className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm border border-gray-200">
                  <div className="p-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">ORCID Profile Information</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {isOrcidLinked
                            ? "Synced from your ORCID account"
                            : "Not linked to ORCID"}
                        </p>
                      </div>
                      {isOrcidLinked && (
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-300">
                          Linked
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6 flex-1 overflow-y-auto">
                    {isLoadingOrcidStatus ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang kiểm tra trạng thái ORCID...</p>
                      </div>
                    ) : !isOrcidLinked ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-gray-500" />
                        </div>
                        <h4 className="text-lg font-medium mb-2 text-gray-900">Chưa liên kết ORCID</h4>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Vui lòng liên kết tài khoản ORCID của bạn để đồng bộ thông tin học thuật,
                          công trình nghiên cứu và quá trình học tập.
                        </p>
                        <Button
                          onClick={handleOrcidLink}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Liên kết ORCID ngay
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Biography Section */}
                        <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                            <h4 className="text-base font-semibold text-gray-900">Tiểu sử</h4>
                          </div>
                          {isLoadingBio ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                              <p className="text-sm text-gray-600">Đang tải...</p>
                            </div>
                          ) : biographyData?.data?.Content ? (
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {biographyData.data.Content}
                            </p>
                          ) : (
                            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
                              <p className="text-sm text-amber-800">
                                Bạn chưa có thông tin tiểu sử trên ORCID. Vui lòng cập nhật tiểu sử trên hồ sơ ORCID của bạn để đồng bộ thông tin này.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Works Section */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                            <h4 className="text-base font-semibold text-gray-900">
                              Công trình nghiên cứu
                              {!isLoadingWorks && worksData?.data?.group && ` (${worksData.data.group.length})`}
                            </h4>
                          </div>
                          {isLoadingWorks ? (
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <p className="text-sm text-gray-600">Đang tải công trình...</p>
                            </div>
                          ) : worksData?.data?.group?.length ? (
                            <div className="relative -mx-6 px-6">
                              <div
                                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                                style={{
                                  scrollbarWidth: 'thin',
                                  scrollbarColor: '#9ca3af #e5e7eb'
                                }}
                              >
                                {worksData.data.group.map((workGroup) => {
                                  const work = workGroup['work-summary'][0];
                                  const pubDate = formatPublicationDate(work['publication-date']);
                                  const sourceName = work.source['source-name']?.value;

                                  return (
                                    <article
                                      key={work['put-code']}
                                      className="flex-shrink-0 w-80 bg-white rounded-xl p-5 hover:bg-gray-50 transition-all border border-gray-200 hover:border-blue-400 snap-start hover:shadow-lg"
                                    >
                                      <div className="flex flex-col h-full space-y-3">
                                        <div className="flex items-start gap-2">
                                          <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="text-sm font-semibold leading-snug text-gray-900 line-clamp-2 mb-2">
                                              {work.title.title.value ||
                                                <span className="text-gray-500 italic">Chưa có tiêu đề</span>
                                              }
                                            </h5>
                                            {work.title.subtitle && (
                                              <p className="text-xs text-gray-600 line-clamp-1">
                                                {work.title.subtitle.value}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                          {work.type && (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-300 whitespace-nowrap">
                                              {work.type}
                                            </span>
                                          )}
                                          {pubDate && (
                                            <span className="text-gray-600 whitespace-nowrap">{pubDate}</span>
                                          )}
                                        </div>

                                        {work['journal-title']?.value && (
                                          <div className="text-xs">
                                            <span className="text-gray-500 font-medium">Journal: </span>
                                            <span className="text-gray-700 line-clamp-1">{work['journal-title'].value}</span>
                                          </div>
                                        )}

                                        {sourceName && (
                                          <div className="text-xs">
                                            <span className="text-gray-500 font-medium">Source: </span>
                                            <span className="text-gray-700 line-clamp-1">{sourceName}</span>
                                          </div>
                                        )}

                                        {work['external-ids']?.['external-id']?.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5 text-xs">
                                            {work['external-ids']['external-id'].slice(0, 2).map((id, idx) => (
                                              <div key={idx} className="bg-gray-100 px-2 py-1 rounded border border-gray-300 truncate max-w-full">
                                                <span className="text-gray-600">{id['external-id-type']}: </span>
                                                <span className="text-gray-800">{id['external-id-value']}</span>
                                              </div>
                                            ))}
                                            {work['external-ids']['external-id'].length > 2 && (
                                              <span className="text-gray-500 px-2 py-1">
                                                +{work['external-ids']['external-id'].length - 2} more
                                              </span>
                                            )}
                                          </div>
                                        )}

                                        <div className="flex-1"></div>

                                        <div className="space-y-2 pt-2 border-t border-gray-200">
                                          <div className="flex items-center justify-between">
                                            <span className={`text-xs px-2 py-1 rounded border ${work.visibility === 'PUBLIC'
                                              ? 'bg-green-100 text-green-700 border-green-300'
                                              : 'bg-gray-100 text-gray-700 border-gray-300'
                                              }`}>
                                              {work.visibility}
                                            </span>

                                            {work.url?.value && (
                                              <a
                                                href={work.url.value}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                              >
                                                <span>View</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                              </a>
                                            )}
                                          </div>

                                          <div className="text-xs text-gray-500">
                                            Modified: {new Date(work['last-modified-date'].value).toLocaleDateString('vi-VN')}
                                          </div>
                                        </div>
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                              <p className="text-sm text-amber-800 text-center">
                                Bạn chưa có công trình nghiên cứu nào trên ORCID. Vui lòng thêm công trình nghiên cứu trên hồ sơ ORCID của bạn để đồng bộ thông tin này.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Education Section */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 bg-green-600 rounded-full"></div>
                            <h4 className="text-base font-semibold text-gray-900">
                              Quá trình học tập
                              {!isLoadingEdu && educationsData?.data && ` (${educationsData.data.length})`}
                            </h4>
                          </div>
                          {isLoadingEdu ? (
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              <p className="text-sm text-gray-600">Đang tải quá trình học tập...</p>
                            </div>
                          ) : educationsData?.data?.length ? (
                            <div className="space-y-3">
                              {educationsData.data.map((edu, index) => (
                                <article
                                  key={edu.OrcidPutCode || index}
                                  className="bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors border border-gray-200"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                      <h5 className="text-sm font-medium text-gray-900">
                                        {edu.Degree ||
                                          <span className="text-gray-500 italic">Chưa cập nhật bằng cấp</span>
                                        }
                                      </h5>
                                      <p className="text-sm text-gray-600">
                                        {edu.Institution ||
                                          <span className="italic">Chưa cập nhật trường học</span>
                                        }
                                      </p>
                                      {edu.Period ? (
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <Calendar className="w-3 h-3" />
                                          <span>{edu.Period}</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-xs text-amber-700">
                                          <Calendar className="w-3 h-3" />
                                          <span className="italic">Chưa cập nhật thời gian</span>
                                        </div>
                                      )}
                                      {edu.Location && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {edu.Location}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </article>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                              <p className="text-sm text-amber-800 text-center">
                                Bạn chưa có thông tin học tập nào trên ORCID. Vui lòng thêm quá trình học tập trên hồ sơ ORCID của bạn để đồng bộ thông tin này.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        as="div"
        className="relative z-50"
        onClose={() => {
          if (hasUnsavedChanges) {
            setShowUnsavedWarning(true);
          } else {
            setIsEditDialogOpen(false);
          }
        }}
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              className="relative w-full max-w-2xl bg-white border border-gray-300 text-gray-900 rounded-2xl shadow-xl overflow-hidden duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
              transition
            >
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    setShowUnsavedWarning(true);
                  } else {
                    setIsEditDialogOpen(false);
                  }
                }}
                className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <h2 className="text-2xl font-bold mb-8 text-gray-900">Edit Personal Information</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName" className="text-sm text-gray-700 mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={editFormData.fullName || ""}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 rounded-xl"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm text-gray-700 mb-2 block">
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={editFormData.phoneNumber || ""}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 rounded-xl"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="gender" className="text-sm text-gray-700 mb-2 block">
                        Gender
                      </Label>
                      <Select
                        value={editFormData.gender || ""}
                        onValueChange={(value) => handleInputChange("gender", value || null)}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 rounded-xl">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="birthDay" className="text-sm text-gray-700 mb-2 block">
                        Birth Date
                      </Label>
                      <Input
                        id="birthDay"
                        type="date"
                        value={
                          editFormData.birthDay
                            ? new Date(editFormData.birthDay).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => handleInputChange("birthDay", e.target.value || null)}
                        className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 rounded-xl"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="bioDescription" className="text-sm text-gray-700 mb-2 block">
                        Bio
                      </Label>
                      <textarea
                        id="bioDescription"
                        value={editFormData.bioDescription || ""}
                        onChange={(e) => handleInputChange("bioDescription", e.target.value)}
                        rows={4}
                        placeholder="Write something about yourself..."
                        className="w-full bg-white border border-gray-300 text-gray-900 p-4 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {updateError && (
                    <div className="bg-red-50 border border-red-300 rounded-xl p-4">
                      <p className="text-red-700 text-sm">
                        {typeof updateError === "string" ? updateError : "Error updating profile"}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (hasUnsavedChanges) {
                          setShowUnsavedWarning(true);
                        } else {
                          setIsEditDialogOpen(false);
                        }
                      }}
                      disabled={isUpdating}
                      className="bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      disabled={isUpdating}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={isChangePassDialogOpen}
        as="div"
        className="relative z-50"
        onClose={setIsChangePassDialogOpen}
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative w-full max-w-md bg-white border border-gray-300 text-gray-900 rounded-2xl shadow-xl overflow-hidden duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
            >
              <button
                onClick={() => setIsChangePassDialogOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="oldPassword" className="text-sm text-gray-700 mb-2 block">
                      Current Password
                    </Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 rounded-xl"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-sm text-gray-700 mb-2 block">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 rounded-xl"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmNewPassword" className="text-sm text-gray-700 mb-2 block">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={passwordData.confirmNewPassword}
                      onChange={(e) => handlePasswordChange("confirmNewPassword", e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 rounded-xl"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {changePasswordError && (
                    <div className="bg-red-50 border border-red-300 rounded-xl p-4">
                      <p className="text-red-700 text-sm">
                        {typeof changePasswordError === "string"
                          ? changePasswordError
                          : "Error changing password"}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setIsChangePassDialogOpen(false)}
                      disabled={isChanging}
                      className="bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSavePassword}
                      disabled={isChanging}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                    >
                      {isChanging ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Unsaved Warning Dialog */}
      <Dialog
        open={showUnsavedWarning}
        as="div"
        className="relative z-50"
        onClose={() => setShowUnsavedWarning(false)}
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative w-full max-w-md bg-white border border-gray-300 text-gray-900 rounded-2xl shadow-xl overflow-hidden duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Unsaved Changes</h2>
                </div>

                <p className="text-gray-700 mb-8">
                  You have unsaved changes. Are you sure you want to leave without saving?
                </p>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowUnsavedWarning(false)}
                    className="bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-6"
                  >
                    Continue Editing
                  </Button>
                  <Button
                    onClick={() => {
                      setShowUnsavedWarning(false);
                      setIsEditDialogOpen(false);
                      setHasUnsavedChanges(false);
                      if (profile) {
                        setEditFormData({
                          fullName: profile.fullName || "",
                          phoneNumber: profile.phoneNumber || "",
                          gender: profile.gender as "Male" | "Female" | "Other" | null,
                          bioDescription: profile.bioDescription || "",
                          birthDay: profile.birthDay || null,
                        });
                      }
                      setAvatarFile(null);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6"
                  >
                    Discard Changes
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default EditProfileScreen;

// "use client";

// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Dialog, DialogPanel } from "@headlessui/react";
// import {
//   UserProfileResponse,
//   ProfileUpdateRequest,
//   ChangePasswordRequest,
// } from "@/types/user.type";
// import { Edit, MapPin, X, Lock, CheckCircle, XCircle, Users, Calendar, AlertTriangle } from "lucide-react";
// import { useAuth } from "@/redux/hooks/useAuth";
// import { useProfile } from "@/redux/hooks/useProfile";
// import { useGetOrcidStatusQuery, useLazyAuthorizeOrcidQuery, useLazyGetBiographyQuery, useLazyGetEducationsQuery, useLazyGetWorksQuery } from "@/redux/services/orcid.service";

// const EditProfileScreen: React.FC = () => {
//   const { user } = useAuth();
//   const userId = user?.userId;

//   const {
//     profile,
//     isLoading: profileLoading,
//     error: profileError,
//     refetch,
//     updateProfile,
//     isUpdating,
//     updateError,
//     changePassword,
//     isChanging,
//     changePasswordError,
//   } = useProfile();

//   const { data: orcidStatusData, isLoading: isLoadingOrcidStatus } = useGetOrcidStatusQuery();

//   const [triggerAuthorizeOrcid, { data: authorizeData, isFetching }] = useLazyAuthorizeOrcidQuery();

//   const [triggerGetWorks, { data: worksData, isLoading: isLoadingWorks }] =
//     useLazyGetWorksQuery();
//   const [triggerGetBiography, { data: biographyData, isLoading: isLoadingBio }] =
//     useLazyGetBiographyQuery();
//   const [triggerGetEducations, { data: educationsData, isLoading: isLoadingEdu }] =
//     useLazyGetEducationsQuery();

//   const orcidStatus = orcidStatusData?.data;
//   const isOrcidLinked = orcidStatus?.isLinked || false;

//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [isEditingLocation, setIsEditingLocation] = useState(false);
//   const [isEditingBio, setIsEditingBio] = useState(false);
//   const [editFormData, setEditFormData] = useState<Partial<UserProfileResponse>>({
//     fullName: "",
//     phoneNumber: "",
//     gender: null,
//     bioDescription: "",
//     birthDay: null,
//   });

//   const [isChangePassDialogOpen, setIsChangePassDialogOpen] = useState(false);
//   const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
//     oldPassword: "",
//     newPassword: "",
//     confirmNewPassword: "",
//   });

//   const [avatarFile, setAvatarFile] = useState<File | null>(null);
//   // const [isOrcidLinked, setIsOrcidLinked] = useState(true);
//   const [tempLocation, setTempLocation] = useState("");
//   const [tempBio, setTempBio] = useState("");
//   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
//   const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

//   const [activeTab, setActiveTab] = useState<"profile" | "orcid">("profile");

//   const calculateCompletion = () => {
//     const fields = [
//       { value: profile?.fullName, weight: 10 },
//       { value: profile?.avatarUrl, weight: 5 },
//       { value: profile?.phoneNumber, weight: 10 },
//       { value: profile?.bioDescription, weight: 20 },
//       { value: profile?.birthDay, weight: 15 },
//       { value: profile?.gender, weight: 15 },
//       { value: true, weight: 15 },
//       { value: false, weight: 10 },
//     ];

//     const completed = fields.reduce((sum, field) => {
//       return sum + (field.value ? field.weight : 0);
//     }, 0);

//     return completed;
//   };

//   const completionPercentage = calculateCompletion();

//   const formatPublicationDate = (pubDate?: { year?: { value: string }, month?: { value: string }, day?: { value: string } }) => {
//     if (!pubDate) return null;
//     const parts = [];
//     if (pubDate.month?.value) parts.push(pubDate.month.value.padStart(2, '0'));
//     if (pubDate.day?.value) parts.push(pubDate.day.value.padStart(2, '0'));
//     if (pubDate.year?.value) parts.push(pubDate.year.value);
//     return parts.length > 0 ? parts.join('/') : null;
//   };

//   useEffect(() => {
//     if (activeTab === "orcid" && isOrcidLinked) {
//       triggerGetWorks();
//       triggerGetBiography();
//       triggerGetEducations();
//     }
//   }, [activeTab, isOrcidLinked, triggerGetWorks, triggerGetBiography, triggerGetEducations]);

//   useEffect(() => {
//     if (profile) {
//       setEditFormData({
//         fullName: profile.fullName || "",
//         phoneNumber: profile.phoneNumber || "",
//         gender: profile.gender as "Male" | "Female" | "Other" | null,
//         bioDescription: profile.bioDescription || "",
//         birthDay: profile.birthDay || null,
//       });
//       setTempLocation(profile.bioDescription || "");
//       setTempBio(profile.bioDescription || "");
//     }
//   }, [profile]);

//   useEffect(() => {
//     if (profile) {
//       const changed =
//         editFormData.fullName !== (profile.fullName || "") ||
//         editFormData.phoneNumber !== (profile.phoneNumber || "") ||
//         editFormData.gender !== profile.gender ||
//         editFormData.bioDescription !== (profile.bioDescription || "") ||
//         editFormData.birthDay !== profile.birthDay ||
//         avatarFile !== null;

//       setHasUnsavedChanges(changed);
//     }
//   }, [editFormData, avatarFile, profile]);

//   useEffect(() => {
//     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//       if (hasUnsavedChanges) {
//         e.preventDefault();
//         e.returnValue = '';
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//   }, [hasUnsavedChanges]);

//   const handleInputChange = (field: string, value: string | null) => {
//     setEditFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setAvatarFile(file);
//     }
//   };

//   const handleSaveChanges = async () => {
//     try {
//       const updateData: ProfileUpdateRequest = {
//         fullName: editFormData.fullName || undefined,
//         phoneNumber: editFormData.phoneNumber ?? undefined,
//         gender: editFormData.gender as "Male" | "Female" | "Other" | undefined,
//         bioDescription: editFormData.bioDescription ?? undefined,
//         birthDay: editFormData.birthDay ?? undefined,
//         avatarFile: avatarFile || undefined,
//       };

//       await updateProfile(updateData);
//       alert("Cập nhật hồ sơ thành công!");
//       setIsEditDialogOpen(false);
//       setAvatarFile(null);
//       setHasUnsavedChanges(false);
//     } catch (error: unknown) {
//       const errorMessage = "Có lỗi xảy ra khi cập nhật hồ sơ";
//       alert(errorMessage);
//     }
//   };

//   const handleSaveLocation = () => {
//     handleInputChange("bioDescription", tempLocation);
//     setIsEditingLocation(false);
//   };

//   const handleSaveBio = () => {
//     handleInputChange("bioDescription", tempBio);
//     setIsEditingBio(false);
//   };

//   const handlePasswordChange = (
//     field: keyof ChangePasswordRequest,
//     value: string,
//   ) => {
//     setPasswordData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSavePassword = async () => {
//     if (passwordData.newPassword !== passwordData.confirmNewPassword) {
//       alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
//       return;
//     }

//     try {
//       await changePassword(passwordData);
//       alert("Đổi mật khẩu thành công!");
//       setIsChangePassDialogOpen(false);
//       setPasswordData({
//         oldPassword: "",
//         newPassword: "",
//         confirmNewPassword: "",
//       });
//     } catch (error: unknown) {
//       const errorMessage = "Có lỗi xảy ra khi đổi mật khẩu";
//       alert(errorMessage);
//     }
//   };


//   const handleOrcidLink = async () => {
//     try {
//       const response = await triggerAuthorizeOrcid().unwrap();

//       const link = response?.data;

//       if (link) {
//         window.location.href = link; // Redirect sang ORCID
//       } else {
//         alert("Không thể liên kết ORCID");
//       }
//     } catch (error) {
//       console.error("Error authorizing ORCID:", error);
//       alert("Có lỗi xảy ra khi liên kết ORCID");
//     }
//   };

//   if (!userId) {
//     return (
//       <div className="min-h-screen bg-[#1a1d2e] text-white flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold mb-2">Không thể tải hồ sơ</h2>
//           <p className="text-gray-400">Vui lòng đăng nhập để xem hồ sơ.</p>
//         </div>
//       </div>
//     );
//   }

//   if (profileLoading) {
//     return (
//       <div className="min-h-screen bg-[#1a1d2e] text-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-400">Đang tải hồ sơ...</p>
//         </div>
//       </div>
//     );
//   }

//   if (profileError || !profile) {
//     return (
//       <div className="min-h-screen bg-[#1a1d2e] text-white flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold mb-2">Lỗi tải hồ sơ</h2>
//           <p className="text-gray-400 mb-4">
//             {profileError
//               ? "Có lỗi xảy ra khi tải hồ sơ."
//               : "Không tìm thấy thông tin hồ sơ."}
//           </p>
//           <Button
//             onClick={() => refetch()}
//             className="bg-blue-600 hover:bg-blue-700"
//           >
//             Thử lại
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#1a1d2e] text-white">
//       <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <header className="mb-8">
//           <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

//           {activeTab === "profile" && (
//             <Button
//               onClick={() => setIsChangePassDialogOpen(true)}
//               className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
//             >
//               <Lock className="w-4 h-4" />
//               Change Password
//             </Button>
//           )}

//           {/* Tabs Navigation */}
//           <div className="flex gap-2 border-b border-gray-700">
//             <button
//               onClick={() => setActiveTab("profile")}
//               className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "profile"
//                 ? "text-blue-500"
//                 : "text-gray-400 hover:text-gray-300"
//                 }`}
//             >
//               Profile & Settings
//               {activeTab === "profile" && (
//                 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
//               )}
//             </button>
//             <button
//               onClick={() => setActiveTab("orcid")}
//               className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "orcid"
//                 ? "text-blue-500"
//                 : "text-gray-400 hover:text-gray-300"
//                 }`}
//             >
//               ORCID Information
//               {activeTab === "orcid" && (
//                 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
//               )}
//             </button>
//           </div>

//           {hasUnsavedChanges && activeTab === "profile" && (
//             <div className="mt-4 bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 flex items-center gap-2">
//               <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
//               <p>
//                 Bạn có thay đổi chưa được lưu. Nhớ bấm nút &quot;Save Changes&quot; trong dialog để lưu thông tin.
//               </p>
//             </div>
//           )}
//         </header>

//         <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           {activeTab === "profile" ? (
//             <>
//               {/* Tab 1: Profile Content */}
//               <section className="lg:col-span-7 flex flex-col gap-6">
//                 <div className="bg-[#252836] rounded-2xl p-8 space-y-8">
//                   {/* Avatar Upload - giữ nguyên */}
//                   <div className="flex items-start gap-6">
//                     {/* ... existing avatar code ... */}
//                   </div>

//                   {/* Personal Info với Edit button mở Dialog */}
//                   <div>
//                     <div className="flex items-center justify-between mb-6">
//                       <h3 className="text-xl font-semibold">Personal Info</h3>
//                       <button
//                         onClick={() => setIsEditDialogOpen(true)}
//                         className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
//                       >
//                         <Edit className="w-4 h-4" />
//                         Edit
//                       </button>
//                     </div>
//                     <div className="grid grid-cols-3 gap-6 bg-[#1a1d2e] rounded-xl p-6">
//                       <div>
//                         <Label className="text-sm text-gray-400 mb-2 block">Full Name</Label>
//                         <p className="text-white font-medium">{editFormData.fullName || "Not set"}</p>
//                       </div>
//                       <div>
//                         <Label className="text-sm text-gray-400 mb-2 block">Email</Label>
//                         <p className="text-white font-medium">{profile.email || "Not set"}</p>
//                       </div>
//                       <div>
//                         <Label className="text-sm text-gray-400 mb-2 block">Phone</Label>
//                         <p className="text-white font-medium">{editFormData.phoneNumber || "Not set"}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Bio Section - CHỈ HIỂN THỊ, không cho edit trực tiếp */}
//                   <div>
//                     <div className="flex items-center justify-between mb-6">
//                       <h3 className="text-xl font-semibold">Bio</h3>
//                       <button
//                         onClick={() => setIsEditDialogOpen(true)}
//                         className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
//                       >
//                         <Edit className="w-4 h-4" />
//                         Edit
//                       </button>
//                     </div>
//                     <div className="bg-[#1a1d2e] rounded-xl p-6">
//                       <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
//                         {editFormData.bioDescription || "No bio added yet"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </section>

//               {/* Right Sidebar - Progress */}
//               <section className="lg:col-span-5">
//                 <div className="bg-[#252836] rounded-2xl p-8 sticky top-6">
//                   <h3 className="text-xl font-semibold mb-8">Complete your profile</h3>
//                   <div className="flex justify-center mb-8">
//                     <div className="relative w-48 h-48">
//                       <svg className="w-full h-full transform -rotate-90">
//                         <circle
//                           cx="96"
//                           cy="96"
//                           r="88"
//                           stroke="#2d3142"
//                           strokeWidth="12"
//                           fill="none"
//                         />
//                         <circle
//                           cx="96"
//                           cy="96"
//                           r="88"
//                           stroke="#10b981"
//                           strokeWidth="12"
//                           fill="none"
//                           strokeDasharray={`${2 * Math.PI * 88}`}
//                           strokeDashoffset={`${2 * Math.PI * 88 * (1 - completionPercentage / 100)}`}
//                           strokeLinecap="round"
//                           className="transition-all duration-1000"
//                         />
//                       </svg>
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <span className="text-4xl font-bold">{completionPercentage}%</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between py-3">
//                       <div className="flex items-center gap-3">
//                         <CheckCircle className="w-5 h-5 text-green-500" />
//                         <span className="text-white">Setup account</span>
//                       </div>
//                       <span className="text-sm text-gray-400">10%</span>
//                     </div>

//                     <div className="flex items-center justify-between py-3">
//                       <div className="flex items-center gap-3">
//                         {profile.avatarUrl ? (
//                           <CheckCircle className="w-5 h-5 text-green-500" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-gray-500" />
//                         )}
//                         <span className={profile.avatarUrl ? "text-white" : "text-gray-400"}>
//                           Upload your photo
//                         </span>
//                       </div>
//                       <span className="text-sm text-gray-400">5%</span>
//                     </div>

//                     <div className="flex items-center justify-between py-3">
//                       <div className="flex items-center gap-3">
//                         {profile.phoneNumber ? (
//                           <CheckCircle className="w-5 h-5 text-green-500" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-gray-500" />
//                         )}
//                         <span className={profile.phoneNumber ? "text-white" : "text-gray-400"}>
//                           Personal Info
//                         </span>
//                       </div>
//                       <span className="text-sm text-gray-400">10%</span>
//                     </div>

//                     <div className="flex items-center justify-between py-3">
//                       <div className="flex items-center gap-3">
//                         {profile.bioDescription ? (
//                           <CheckCircle className="w-5 h-5 text-green-500" />
//                         ) : (
//                           <XCircle className="w-5 h-5 text-gray-500" />
//                         )}
//                         <span className={profile.bioDescription ? "text-white" : "text-gray-400"}>
//                           Biography
//                         </span>
//                       </div>
//                       <span className="text-sm text-gray-400">15%</span>
//                     </div>

//                     <div className="flex items-center justify-between py-3">
//                       <div className="flex items-center gap-3">
//                         <CheckCircle className="w-5 h-5 text-green-500" />
//                         <span className="text-white">Notifications</span>
//                       </div>
//                       <span className="text-sm text-green-400">+10%</span>
//                     </div>

//                     <div className="flex items-center justify-between py-3">
//                       <div className="flex items-center gap-3">
//                         <XCircle className="w-5 h-5 text-gray-500" />
//                         <span className="text-gray-400">Bank details</span>
//                       </div>
//                       <span className="text-sm text-green-400">+30%</span>
//                     </div>
//                   </div>
//                 </div>
//               </section>
//             </>
//           ) : (
//             <>
//               {/* Tab 2: ORCID Content - Full Width */}
//               <section className="lg:col-span-12">
//                 <div className="bg-[#252836] rounded-2xl overflow-hidden flex flex-col">
//                   <div className="p-6 pb-4 border-b border-gray-700">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-semibold">ORCID Profile Information</h3>
//                         <p className="text-sm text-gray-400 mt-1">
//                           {isOrcidLinked
//                             ? "Synced from your ORCID account"
//                             : "Not linked to ORCID"}
//                         </p>
//                       </div>
//                       {isOrcidLinked && (
//                         <span className="text-xs bg-green-900 text-green-300 px-3 py-1 rounded-full border border-green-700">
//                           Linked
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                   <div className="p-6 flex-1 overflow-y-auto">
//                     {isLoadingOrcidStatus ? (
//                       <div className="text-center py-12">
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
//                         <p className="text-gray-400">Đang kiểm tra trạng thái ORCID...</p>
//                       </div>
//                     ) : !isOrcidLinked ? (
//                       <div className="text-center py-12">
//                         <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
//                           <Users className="w-8 h-8 text-gray-500" />
//                         </div>
//                         <h4 className="text-lg font-medium mb-2">Chưa liên kết ORCID</h4>
//                         <p className="text-gray-400 mb-6 max-w-md mx-auto">
//                           Vui lòng liên kết tài khoản ORCID của bạn để đồng bộ thông tin học thuật,
//                           công trình nghiên cứu và quá trình học tập.
//                         </p>
//                         <Button
//                           onClick={handleOrcidLink}
//                           className="bg-green-600 hover:bg-green-700"
//                         >
//                           Liên kết ORCID ngay
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="space-y-6">
//                         {/* Biography Section */}
//                         <div className="bg-gray-800/50 rounded-lg p-5">
//                           <div className="flex items-center gap-2 mb-3">
//                             <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
//                             <h4 className="text-base font-semibold">Tiểu sử</h4>
//                           </div>
//                           {isLoadingBio ? (
//                             <div className="flex items-center gap-2">
//                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
//                               <p className="text-sm text-gray-400">Đang tải...</p>
//                             </div>
//                           ) : biographyData?.data?.Content ? (
//                             <p className="text-sm text-gray-300 leading-relaxed">
//                               {biographyData.data.Content}
//                             </p>
//                           ) : (
//                             <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
//                               <p className="text-sm text-yellow-300">
//                                 Bạn chưa có thông tin tiểu sử trên ORCID. Vui lòng cập nhật tiểu sử trên hồ sơ ORCID của bạn để đồng bộ thông tin này.
//                               </p>
//                             </div>
//                           )}
//                         </div>

//                         {/* Works Section */}
//                         <div>
//                           <div className="flex items-center gap-2 mb-4">
//                             <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
//                             <h4 className="text-base font-semibold">
//                               Công trình nghiên cứu
//                               {!isLoadingWorks && worksData?.data?.group && ` (${worksData.data.group.length})`}
//                             </h4>
//                           </div>
//                           {isLoadingWorks ? (
//                             <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-4">
//                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//                               <p className="text-sm text-gray-400">Đang tải công trình...</p>
//                             </div>
//                           ) : worksData?.data?.group?.length ? (
//                             <div className="relative -mx-6 px-6">
//                               <div
//                                 className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800/50"
//                                 style={{
//                                   scrollbarWidth: 'thin',
//                                   scrollbarColor: '#374151 rgba(31, 41, 55, 0.5)'
//                                 }}
//                               >
//                                 {worksData.data.group.map((workGroup) => {
//                                   const work = workGroup['work-summary'][0];
//                                   const pubDate = formatPublicationDate(work['publication-date']);
//                                   const sourceName = work.source['source-name']?.value;

//                                   return (
//                                     <article
//                                       key={work['put-code']}
//                                       className="flex-shrink-0 w-80 bg-gray-800 rounded-xl p-5 hover:bg-gray-750 transition-all border border-gray-700 hover:border-blue-500/50 snap-start hover:shadow-lg hover:shadow-blue-500/10"
//                                     >
//                                       <div className="flex flex-col h-full space-y-3">
//                                         {/* Header with dot indicator */}
//                                         <div className="flex items-start gap-2">
//                                           <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
//                                           <div className="flex-1 min-w-0">
//                                             <h5 className="text-sm font-semibold leading-snug text-white line-clamp-2 mb-2">
//                                               {work.title.title.value ||
//                                                 <span className="text-gray-400 italic">Chưa có tiêu đề</span>
//                                               }
//                                             </h5>
//                                             {work.title.subtitle && (
//                                               <p className="text-xs text-gray-400 line-clamp-1">
//                                                 {work.title.subtitle.value}
//                                               </p>
//                                             )}
//                                           </div>
//                                         </div>

//                                         {/* Metadata badges */}
//                                         <div className="flex flex-wrap items-center gap-2 text-xs">
//                                           {work.type && (
//                                             <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded border border-blue-700 whitespace-nowrap">
//                                               {work.type}
//                                             </span>
//                                           )}
//                                           {pubDate && (
//                                             <span className="text-gray-400 whitespace-nowrap">{pubDate}</span>
//                                           )}
//                                         </div>

//                                         {/* Journal Title */}
//                                         {work['journal-title']?.value && (
//                                           <div className="text-xs">
//                                             <span className="text-gray-500 font-medium">Journal: </span>
//                                             <span className="text-gray-300 line-clamp-1">{work['journal-title'].value}</span>
//                                           </div>
//                                         )}

//                                         {/* Source */}
//                                         {sourceName && (
//                                           <div className="text-xs">
//                                             <span className="text-gray-500 font-medium">Source: </span>
//                                             <span className="text-gray-300 line-clamp-1">{sourceName}</span>
//                                           </div>
//                                         )}

//                                         {/* External IDs */}
//                                         {work['external-ids']?.['external-id']?.length > 0 && (
//                                           <div className="flex flex-wrap gap-1.5 text-xs">
//                                             {work['external-ids']['external-id'].slice(0, 2).map((id, idx) => (
//                                               <div key={idx} className="bg-gray-700/50 px-2 py-1 rounded border border-gray-600 truncate max-w-full">
//                                                 <span className="text-gray-400">{id['external-id-type']}: </span>
//                                                 <span className="text-gray-300">{id['external-id-value']}</span>
//                                               </div>
//                                             ))}
//                                             {work['external-ids']['external-id'].length > 2 && (
//                                               <span className="text-gray-500 px-2 py-1">
//                                                 +{work['external-ids']['external-id'].length - 2} more
//                                               </span>
//                                             )}
//                                           </div>
//                                         )}

//                                         {/* Spacer */}
//                                         <div className="flex-1"></div>

//                                         {/* Footer section */}
//                                         <div className="space-y-2 pt-2 border-t border-gray-700">
//                                           {/* Visibility badge */}
//                                           <div className="flex items-center justify-between">
//                                             <span className={`text-xs px-2 py-1 rounded border ${work.visibility === 'PUBLIC'
//                                               ? 'bg-green-900/40 text-green-300 border-green-700'
//                                               : 'bg-gray-700 text-gray-300 border-gray-600'
//                                               }`}>
//                                               {work.visibility}
//                                             </span>

//                                             {/* URL Link */}
//                                             {work.url?.value && (
//                                               <a
//                                                 href={work.url.value}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
//                                               >
//                                                 <span>View</span>
//                                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                                                 </svg>
//                                               </a>
//                                             )}
//                                           </div>

//                                           {/* Last Modified */}
//                                           <div className="text-xs text-gray-500">
//                                             Modified: {new Date(work['last-modified-date'].value).toLocaleDateString('vi-VN')}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </article>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           ) : (
//                             <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
//                               <p className="text-sm text-yellow-300 text-center">
//                                 Bạn chưa có công trình nghiên cứu nào trên ORCID. Vui lòng thêm công trình nghiên cứu trên hồ sơ ORCID của bạn để đồng bộ thông tin này.
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                         <div>
//                           <div className="flex items-center gap-2 mb-4">
//                             <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
//                             <h4 className="text-base font-semibold">
//                               Công trình nghiên cứu
//                               {!isLoadingWorks && worksData?.data?.group && ` (${worksData.data.group.length})`}
//                             </h4>
//                           </div>
//                           {isLoadingWorks ? (
//                             <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-4">
//                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//                               <p className="text-sm text-gray-400">Đang tải công trình...</p>
//                             </div>
//                           ) : worksData?.data?.group?.length ? (
//                             <div className="space-y-3">
//                               {worksData.data.group.map((workGroup) => {
//                                 const work = workGroup['work-summary'][0];
//                                 const pubDate = formatPublicationDate(work['publication-date']);
//                                 const sourceName = work.source['source-name']?.value;

//                                 return (
//                                   <article
//                                     key={work['put-code']}
//                                     className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700"
//                                   >
//                                     <div className="flex items-start gap-3">
//                                       <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
//                                       <div className="min-w-0 flex-1 space-y-2">
//                                         {/* Title */}
//                                         <div>
//                                           <h5 className="text-sm font-medium leading-snug text-white">
//                                             {work.title.title.value ||
//                                               <span className="text-gray-400 italic">Chưa có tiêu đề</span>
//                                             }
//                                           </h5>
//                                           {work.title.subtitle && (
//                                             <p className="text-xs text-gray-400 mt-1">
//                                               {work.title.subtitle.value}
//                                             </p>
//                                           )}
//                                         </div>

//                                         {/* Metadata badges */}
//                                         <div className="flex flex-wrap items-center gap-2 text-xs">
//                                           {work.type ? (
//                                             <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded border border-blue-700">
//                                               {work.type}
//                                             </span>
//                                           ) : null}

//                                           {pubDate ? (
//                                             <>
//                                               {work.type && <span className="text-gray-500">•</span>}
//                                               <span className="text-gray-400">{pubDate}</span>
//                                             </>
//                                           ) : null}

//                                           <span className={`px-2 py-1 rounded border ${work.visibility === 'PUBLIC'
//                                             ? 'bg-green-900/40 text-green-300 border-green-700'
//                                             : 'bg-gray-700 text-gray-300 border-gray-600'
//                                             }`}>
//                                             {work.visibility}
//                                           </span>
//                                         </div>

//                                         {/* Journal Title */}
//                                         {work['journal-title']?.value ? (
//                                           <div className="flex items-center gap-2 text-xs text-gray-400">
//                                             <span className="font-medium">Journal:</span>
//                                             <span>{work['journal-title'].value}</span>
//                                           </div>
//                                         ) : null}

//                                         {/* Source */}
//                                         {sourceName ? (
//                                           <div className="flex items-center gap-2 text-xs text-gray-400">
//                                             <span className="font-medium">Source:</span>
//                                             <span>{sourceName}</span>
//                                           </div>
//                                         ) : null}

//                                         {/* External IDs */}
//                                         {work['external-ids']?.['external-id']?.length > 0 && (
//                                           <div className="flex flex-wrap gap-2 text-xs">
//                                             {work['external-ids']['external-id'].map((id, idx) => (
//                                               <div key={idx} className="bg-gray-700/50 px-2 py-1 rounded border border-gray-600">
//                                                 <span className="text-gray-400">{id['external-id-type']}:</span>
//                                                 {' '}
//                                                 <span className="text-gray-300">{id['external-id-value']}</span>
//                                               </div>
//                                             ))}
//                                           </div>
//                                         )}

//                                         {/* URL Link */}
//                                         {work.url?.value && (
//                                           <a
//                                             href={work.url.value}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
//                                           >
//                                             <span>View Full Work</span>
//                                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                                             </svg>
//                                           </a>
//                                         )}

//                                         {/* Last Modified */}
//                                         <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
//                                           Last modified: {new Date(work['last-modified-date'].value).toLocaleDateString('vi-VN')}
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </article>
//                                 );
//                               })}
//                             </div>
//                           ) : (
//                             <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
//                               <p className="text-sm text-yellow-300 text-center">
//                                 Bạn chưa có công trình nghiên cứu nào trên ORCID. Vui lòng thêm công trình nghiên cứu trên hồ sơ ORCID của bạn để đồng bộ thông tin này.
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                         <div>
//                           <div className="flex items-center gap-2 mb-4">
//                             <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
//                             <h4 className="text-base font-semibold">
//                               Công trình nghiên cứu
//                               {!isLoadingWorks && worksData?.data?.group && ` (${worksData.data.group.length})`}
//                             </h4>
//                           </div>
//                           {isLoadingWorks ? (
//                             <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-4">
//                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//                               <p className="text-sm text-gray-400">Đang tải công trình...</p>
//                             </div>
//                           ) : (
//                             <div className="space-y-3">
//                               {worksData?.data?.group?.length ? (
//                                 worksData.data.group.map((workGroup) => {
//                                   const work = workGroup['work-summary'][0]; // Lấy summary đầu tiên
//                                   // const doi = getDOI(work['external-ids']);
//                                   const pubDate = formatPublicationDate(work['publication-date']);
//                                   const sourceName = work.source['source-name']?.value;

//                                   return (
//                                     <article
//                                       key={work['put-code']}
//                                       className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700"
//                                     >
//                                       <div className="flex items-start gap-3">
//                                         <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
//                                         <div className="min-w-0 flex-1 space-y-2">
//                                           {/* Title */}
//                                           <div>
//                                             <h5 className="text-sm font-medium leading-snug text-white">
//                                               {work.title.title.value}
//                                             </h5>
//                                             {work.title.subtitle && (
//                                               <p className="text-xs text-gray-400 mt-1">
//                                                 {work.title.subtitle.value}
//                                               </p>
//                                             )}
//                                           </div>

//                                           {/* Metadata badges */}
//                                           <div className="flex flex-wrap items-center gap-2 text-xs">
//                                             {/* Work Type */}
//                                             <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded border border-blue-700">
//                                               {work.type}
//                                             </span>

//                                             {/* Publication Date */}
//                                             {pubDate && (
//                                               <>
//                                                 <span className="text-gray-500">•</span>
//                                                 <span className="text-gray-400">{pubDate}</span>
//                                               </>
//                                             )}

//                                             {/* Visibility */}
//                                             <span className={`px-2 py-1 rounded border ${work.visibility === 'PUBLIC'
//                                               ? 'bg-green-900/40 text-green-300 border-green-700'
//                                               : 'bg-gray-700 text-gray-300 border-gray-600'
//                                               }`}>
//                                               {work.visibility}
//                                             </span>
//                                           </div>

//                                           {/* Journal Title */}
//                                           {work['journal-title']?.value && (
//                                             <div className="flex items-center gap-2 text-xs text-gray-400">
//                                               <span className="font-medium">Journal:</span>
//                                               <span>{work['journal-title'].value}</span>
//                                             </div>
//                                           )}

//                                           {/* Source */}
//                                           {sourceName && (
//                                             <div className="flex items-center gap-2 text-xs text-gray-400">
//                                               <span className="font-medium">Source:</span>
//                                               <span>{sourceName}</span>
//                                             </div>
//                                           )}

//                                           {/* DOI */}
//                                           {/* {doi && (
//                                             <div className="flex items-start gap-2 text-xs">
//                                               <span className="text-gray-400 font-medium">DOI:</span>
// <a
//                                               href={`https://doi.org/${doi}`}
//                                               target="_blank"
//                                               rel="noopener noreferrer"
//                                               className="text-blue-400 hover:text-blue-300 break-all"
//                       >
//                                               {doi}
//                                             </a>
//                     </div>
//                   )} */}

//                                           {/* External IDs (other than DOI) */}
//                                           {work['external-ids']?.['external-id']?.length > 0 && (
//                                             <div className="flex flex-wrap gap-2 text-xs">
//                                               {work['external-ids']['external-id']
//                                                 .filter(id => id['external-id-type'].toLowerCase() !== 'doi')
//                                                 .map((id, idx) => (
//                                                   <div key={idx} className="bg-gray-700/50 px-2 py-1 rounded border border-gray-600">
//                                                     <span className="text-gray-400">{id['external-id-type']}:</span>
//                                                     {' '}
//                                                     <span className="text-gray-300">{id['external-id-value']}</span>
//                                                   </div>
//                                                 ))
//                                               }
//                                             </div>
//                                           )}

//                                           {/* URL Link */}
//                                           {work.url?.value && (
//                                             <a
//                                               href={work.url.value}
//                                               target="_blank"
//                                               rel="noopener noreferrer"
//                                               className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
//                                             >
//                                               <span>View Full Work</span>
//                                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                                               </svg>
//                                             </a>
//                                           )}

//                                           {/* Last Modified */}
//                                           <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
//                                             Last modified: {new Date(work['last-modified-date'].value).toLocaleDateString('vi-VN')}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </article>
//                                   );
//                                 })
//                               ) : (
//                                 <p className="text-sm text-gray-400 text-center py-4">Chưa có công trình nghiên cứu</p>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                         {/* <div>
//                           <div className="flex items-center gap-2 mb-4">
//                             <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
//                             <h4 className="text-base font-semibold">
//                               Công trình nghiên cứu
//                               {!isLoadingWorks && worksData?.data?.group && ` (${worksData.data.group.length})`}
//                             </h4>
//                           </div>
//                           {isLoadingWorks ? (
//                             <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-4">
//                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//                               <p className="text-sm text-gray-400">Đang tải công trình...</p>
//                             </div>
//                           ) : (
//                             <div className="space-y-3">
//                               {worksData?.data?.group?.length ? (
//                                 worksData.data.group.map((workGroup) => {
//                                   const work = workGroup['work-summary'][0];
//                                   return (
//                                     <article
//                                       key={work['put-code']}
//                                       className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700"
//                                     >
//                                       <div className="flex items-start gap-3">
//                                         <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
//                                         <div className="min-w-0 flex-1">
//                                           <h5 className="text-sm font-medium mb-2 leading-snug">
//                                             {work.title.title.value}
//                                           </h5>
//                                           <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
//                                             <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded">
//                                               {work.type}
//                                             </span>
//                                             {work['publication-date']?.year && (
//                                               <>
//                                                 <span>•</span>
//                                                 <span>{work['publication-date'].year.value}</span>
//                                               </>
//                                             )}
//                                             {work['journal-title'] && (
//                                               <>
//                                                 <span>•</span>
//                                                 <span>{work['journal-title'].value}</span>
//                                               </>
//                                             )}
//                                           </div>
//                                           {work.url?.value && (
//                                             <a
//                                               href={work.url.value}
//                                               target="_blank"
//                                               rel="noopener noreferrer"
//                                               className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
//                                             >
//                                               View Work →
//                                             </a>
//                                           )}
//                                         </div>
//                                       </div>
//                                     </article>
//                                   );
//                                 })
//                               ) : (
//                                 <p className="text-sm text-gray-400 text-center py-4">Chưa có công trình nghiên cứu</p>
//                               )}
//                             </div>
//                           )}
//                         </div> */}

//                         {/* Education Section */}
//                         <div>
//                           <div className="flex items-center gap-2 mb-4">
//                             <div className="w-1 h-5 bg-green-500 rounded-full"></div>
//                             <h4 className="text-base font-semibold">
//                               Quá trình học tập
//                               {!isLoadingEdu && educationsData?.data && ` (${educationsData.data.length})`}
//                             </h4>
//                           </div>
//                           {isLoadingEdu ? (
//                             <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-4">
//                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
//                               <p className="text-sm text-gray-400">Đang tải quá trình học tập...</p>
//                             </div>
//                           ) : educationsData?.data?.length ? (
//                             <div className="space-y-3">
//                               {educationsData.data.map((edu, index) => (
//                                 <article
//                                   key={edu.OrcidPutCode || index}
//                                   className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700"
//                                 >
//                                   <div className="flex items-start gap-3">
//                                     <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
//                                     <div className="min-w-0 flex-1 space-y-2">
//                                       <h5 className="text-sm font-medium">
//                                         {edu.Degree ||
//                                           <span className="text-gray-400 italic">Chưa cập nhật bằng cấp</span>
//                                         }
//                                       </h5>
//                                       <p className="text-sm text-gray-400">
//                                         {edu.Institution ||
//                                           <span className="italic">Chưa cập nhật trường học</span>
//                                         }
//                                       </p>
//                                       {edu.Period ? (
//                                         <div className="flex items-center gap-2 text-xs text-gray-500">
//                                           <Calendar className="w-3 h-3" />
//                                           <span>{edu.Period}</span>
//                                         </div>
//                                       ) : (
//                                         <div className="flex items-center gap-2 text-xs text-yellow-600">
//                                           <Calendar className="w-3 h-3" />
//                                           <span className="italic">Chưa cập nhật thời gian</span>
//                                         </div>
//                                       )}
//                                       {edu.Location && (
//                                         <p className="text-xs text-gray-500 flex items-center gap-1">
//                                           <MapPin className="w-3 h-3" />
//                                           {edu.Location}
//                                         </p>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </article>
//                               ))}
//                             </div>
//                           ) : (
//                             <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
//                               <p className="text-sm text-yellow-300 text-center">
//                                 Bạn chưa có thông tin học tập nào trên ORCID. Vui lòng thêm quá trình học tập trên hồ sơ ORCID của bạn để đồng bộ thông tin này.
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </section>
//             </>
//           )}
//         </main>
//         {/* <header className="mb-8">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <h1 className="text-3xl font-bold">Edit Profile</h1>
//             <div className="flex gap-3">
//               <Button
//                 onClick={() => setIsChangePassDialogOpen(true)}
//                 className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
//               >
//                 <Lock className="w-4 h-4" />
//                 Change Password
//               </Button>
//               <Button
//                 onClick={handleSaveChanges}
//                 disabled={isUpdating || !hasUnsavedChanges}
//                 className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
//               >
//                 {isUpdating ? "Saving..." : "Save All Changes"}
//               </Button>
//             </div>
//           </div>
//           {hasUnsavedChanges && (
//             <div className="mt-4 bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 flex items-center gap-2">
//               <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
//               <p className="text-sm text-yellow-300">
//                 Bạn có thay đổi chưa được lưu. Nhớ bấm nút "Save All Changes" để lưu thông tin.
//               </p>
//             </div>
//           )}
//         </header> */}

//         {/* <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           <section className="lg:col-span-7 flex flex-col gap-6">
//             <div className="bg-[#252836] rounded-2xl p-8 space-y-8">
//               <div className="flex items-start gap-6">
//                 <div className="relative">
//                   <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500">
//                     {profile.avatarUrl ? (
//                       <img
//                         src={profile.avatarUrl}
//                         alt={profile.fullName || "Profile"}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
//                         {(profile.fullName || "U").charAt(0)}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="text-lg font-semibold mb-1">Upload new photo</h3>
//                   <p className="text-sm text-gray-400 mb-4">
//                     At least 800×800 px recommended.<br />
//                     JPG or PNG is allowed
//                   </p>
//                   <Input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleAvatarChange}
//                     className="hidden"
//                     id="avatar-upload"
//                   />
//                   <label
//                     htmlFor="avatar-upload"
//                     className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors text-sm font-medium"
//                   >
//                     Choose file
//                   </label>
//                   {avatarFile && (
//                     <p className="text-green-400 text-sm mt-2">
//                       Selected: {avatarFile.name}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className="text-xl font-semibold">Personal Info</h3>
//                   <button
//                     onClick={() => setIsEditDialogOpen(true)}
//                     className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
//                   >
//                     <Edit className="w-4 h-4" />
//                     Edit
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-3 gap-6 bg-[#1a1d2e] rounded-xl p-6">
//                   <div>
//                     <Label className="text-sm text-gray-400 mb-2 block">Full Name</Label>
//                     <p className="text-white font-medium">{editFormData.fullName || "Not set"}</p>
//                   </div>
//                   <div>
//                     <Label className="text-sm text-gray-400 mb-2 block">Email</Label>
//                     <p className="text-white font-medium">{profile.email || "Not set"}</p>
//                   </div>
//                   <div>
//                     <Label className="text-sm text-gray-400 mb-2 block">Phone</Label>
//                     <p className="text-white font-medium">{editFormData.phoneNumber || "Not set"}</p>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className="text-xl font-semibold">Location</h3>
//                   {!isEditingLocation ? (
//                     <button
//                       onClick={() => {
//                         setTempLocation(editFormData.bioDescription || "");
//                         setIsEditingLocation(true);
//                       }}
//                       className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
//                     >
//                       <Edit className="w-4 h-4" />
//                       Edit
//                     </button>
//                   ) : (
//                     <button
//                       onClick={() => setIsEditingLocation(false)}
//                       className="text-sm text-gray-400 hover:text-white transition-colors"
//                     >
//                       Cancel
//                     </button>
//                   )}
//                 </div>

//                 {isEditingLocation ? (
//                   <div className="bg-[#1a1d2e] rounded-xl p-6">
//                     <div className="flex gap-3">
//                       <div className="flex-1 relative">
//                         <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                         <Input
//                           value={tempLocation}
//                           onChange={(e) => setTempLocation(e.target.value)}
//                           placeholder="California"
//                           className="bg-[#252836] border-gray-600 text-white pl-12 py-3 rounded-xl focus:border-blue-500"
//                         />
//                       </div>
//                       <Button
//                         onClick={handleSaveLocation}
//                         className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
//                       >
//                         Save changes
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-[#1a1d2e] rounded-xl p-6">
//                     <div className="flex items-center gap-3">
//                       <MapPin className="w-5 h-5 text-gray-400" />
//                       <p className="text-white">{editFormData.bioDescription || "Not set"}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className="text-xl font-semibold">Bio</h3>
//                   {!isEditingBio ? (
//                     <button
//                       onClick={() => {
//                         setTempBio(editFormData.bioDescription || "");
//                         setIsEditingBio(true);
//                       }}
//                       className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
//                     >
//                       <Edit className="w-4 h-4" />
//                       Edit
//                     </button>
//                   ) : (
//                     <button
//                       onClick={() => setIsEditingBio(false)}
//                       className="text-sm text-gray-400 hover:text-white transition-colors"
//                     >
//                       Cancel
//                     </button>
//                   )}
//                 </div>

//                 {isEditingBio ? (
//                   <div className="bg-[#1a1d2e] rounded-xl p-6">
//                     <textarea
//                       value={tempBio}
//                       onChange={(e) => setTempBio(e.target.value)}
//                       rows={6}
//                       placeholder="Write something about yourself..."
//                       className="w-full bg-[#252836] border border-gray-600 text-white p-4 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
//                     />
//                     <div className="flex justify-end mt-4">
//                       <Button
//                         onClick={handleSaveBio}
//                         className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
//                       >
//                         Save changes
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-[#1a1d2e] rounded-xl p-6">
//                     <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
//                       {editFormData.bioDescription || "No bio added yet"}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="bg-[#252836] rounded-2xl overflow-hidden flex flex-col">
//               <div className="p-6 pb-4 border-b border-gray-700">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold">ORCID Profile Information</h3>
//                     <p className="text-sm text-gray-400 mt-1">
//                       {isOrcidLinked
//                         ? "Synced from your ORCID account"
//                         : "Not linked to ORCID"}
//                     </p>
//                   </div>
//                   {isOrcidLinked && (
//                     <span className="text-xs bg-green-900 text-green-300 px-3 py-1 rounded-full border border-green-700">
//                       Linked
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <div className="p-6 flex-1 overflow-y-auto">
//                 {!isOrcidLinked ? (
//                   <div className="text-center py-12">
//                     <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
//                       <Users className="w-8 h-8 text-gray-500" />
//                     </div>
//                     <h4 className="text-lg font-medium mb-2">Not linked to ORCID</h4>
//                     <p className="text-gray-400 mb-6 max-w-md mx-auto">
//                       Link your ORCID account to sync academic information, research works, and education history.
//                     </p>
//                     <Button className="bg-green-600 hover:bg-green-700">
//                       Link ORCID Now
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="space-y-6">
//                     <div className="bg-gray-800/50 rounded-lg p-5">
//                       <div className="flex items-center gap-2 mb-3">
//                         <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
//                         <h4 className="text-base font-semibold">Biography</h4>
//                       </div>
//                       <p className="text-sm text-gray-300 leading-relaxed">
//                         {mockOrcidData.biography}
//                       </p>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 mb-4">
//                         <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
//                         <h4 className="text-base font-semibold">Research Works ({mockOrcidData.works.length})</h4>
//                       </div>
//                       <div className="space-y-3">
//                         {mockOrcidData.works.map((work) => (
//                           <article
//                             key={work.id}
//                             className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700"
//                           >
//                             <div className="flex items-start gap-3">
//                               <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
//                               <div className="min-w-0 flex-1">
//                                 <h5 className="text-sm font-medium mb-2 leading-snug">
//                                   {work.title}
//                                 </h5>
//                                 <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
//                                   <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded">
//                                     {work.type}
//                                   </span>
//                                   <span>•</span>
//                                   <span>{work.date}</span>
//                                   {work.journal && (
//                                     <>
//                                       <span>•</span>
//                                       <span>{work.journal}</span>
//                                     </>
//                                   )}
//                                   {work.conference && (
//                                     <>
//                                       <span>•</span>
//                                       <span>{work.conference}</span>
//                                     </>
//                                   )}
//                                 </div>
//                                 {work.doi && (
//                                   <p className="text-xs text-gray-500 mt-2">DOI: {work.doi}</p>
//                                 )}
//                               </div>
//                             </div>
//                           </article>
//                         ))}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 mb-4">
//                         <div className="w-1 h-5 bg-green-500 rounded-full"></div>
//                         <h4 className="text-base font-semibold">Education ({mockOrcidData.education.length})</h4>
//                       </div>
//                       <div className="space-y-3">
//                         {mockOrcidData.education.map((edu) => (
//                           <article
//                             key={edu.id}
//                             className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700"
//                           >
//                             <div className="flex items-start gap-3">
//                               <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
//                               <div className="min-w-0 flex-1">
//                                 <h5 className="text-sm font-medium mb-1">
//                                   {edu.degree}
//                                 </h5>
//                                 <p className="text-sm text-gray-400 mb-2">
//                                   {edu.institution}
//                                 </p>
//                                 <div className="flex items-center gap-2 text-xs text-gray-500">
//                                   <Calendar className="w-3 h-3" />
//                                   <span>{edu.startYear} - {edu.endYear}</span>
//                                 </div>
//                               </div>
//                             </div>
//                           </article>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </section>

//           <section className="lg:col-span-5">
//             <div className="bg-[#252836] rounded-2xl p-8 sticky top-6">
//               <h3 className="text-xl font-semibold mb-8">Complete your profile</h3>

//               <div className="flex justify-center mb-8">
//                 <div className="relative w-48 h-48">
//                   <svg className="w-full h-full transform -rotate-90">
//                     <circle
//                       cx="96"
//                       cy="96"
//                       r="88"
//                       stroke="#2d3142"
//                       strokeWidth="12"
//                       fill="none"
//                     />
//                     <circle
//                       cx="96"
//                       cy="96"
//                       r="88"
//                       stroke="#10b981"
//                       strokeWidth="12"
//                       fill="none"
//                       strokeDasharray={`${2 * Math.PI * 88}`}
//                       strokeDashoffset={`${2 * Math.PI * 88 * (1 - completionPercentage / 100)}`}
//                       strokeLinecap="round"
//                       className="transition-all duration-1000"
//                     />
//                   </svg>
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <span className="text-4xl font-bold">{completionPercentage}%</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <div className="flex items-center justify-between py-3">
//                   <div className="flex items-center gap-3">
//                     <CheckCircle className="w-5 h-5 text-green-500" />
//                     <span className="text-white">Setup account</span>
//                   </div>
//                   <span className="text-sm text-gray-400">10%</span>
//                 </div>

//                 <div className="flex items-center justify-between py-3">
//                   <div className="flex items-center gap-3">
//                     {profile.avatarUrl ? (
//                       <CheckCircle className="w-5 h-5 text-green-500" />
//                     ) : (
//                       <XCircle className="w-5 h-5 text-gray-500" />
//                     )}
//                     <span className={profile.avatarUrl ? "text-white" : "text-gray-400"}>
//                       Upload your photo
//                     </span>
//                   </div>
//                   <span className="text-sm text-gray-400">5%</span>
//                 </div>

//                 <div className="flex items-center justify-between py-3">
//                   <div className="flex items-center gap-3">
//                     {profile.phoneNumber ? (
//                       <CheckCircle className="w-5 h-5 text-green-500" />
//                     ) : (
//                       <XCircle className="w-5 h-5 text-gray-500" />
//                     )}
//                     <span className={profile.phoneNumber ? "text-white" : "text-gray-400"}>
//                       Personal Info
//                     </span>
//                   </div>
//                   <span className="text-sm text-gray-400">10%</span>
//                 </div>

//                 <div className="flex items-center justify-between py-3">
//                   <div className="flex items-center gap-3">
//                     {profile.bioDescription ? (
//                       <CheckCircle className="w-5 h-5 text-green-500" />
//                     ) : (
//                       <XCircle className="w-5 h-5 text-gray-500" />
//                     )}
//                     <span className={profile.bioDescription ? "text-white" : "text-gray-400"}>
//                       Biography
//                     </span>
//                   </div>
//                   <span className="text-sm text-gray-400">15%</span>
//                 </div>

//                 <div className="flex items-center justify-between py-3">
//                   <div className="flex items-center gap-3">
//                     <CheckCircle className="w-5 h-5 text-green-500" />
//                     <span className="text-white">Notifications</span>
//                   </div>
//                   <span className="text-sm text-green-400">+10%</span>
//                 </div>

//                 <div className="flex items-center justify-between py-3">
//                   <div className="flex items-center gap-3">
//                     <XCircle className="w-5 h-5 text-gray-500" />
//                     <span className="text-gray-400">Bank details</span>
//                   </div>
//                   <span className="text-sm text-green-400">+30%</span>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </main> */}
//       </div >

//       <Dialog
//         open={isEditDialogOpen}
//         as="div"
//         className="relative z-50"
//         onClose={() => {
//           if (hasUnsavedChanges) {
//             setShowUnsavedWarning(true);
//           } else {
//             setIsEditDialogOpen(false);
//           }
//         }}
//       >
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <DialogPanel
//               className="relative w-full max-w-2xl bg-[#252836] border border-gray-700 text-white rounded-2xl shadow-xl overflow-hidden duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
//               transition
//             >
//               <button
//                 onClick={() => {
//                   if (hasUnsavedChanges) {
//                     setShowUnsavedWarning(true);
//                   } else {
//                     setIsEditDialogOpen(false);
//                   }
//                 }}
//                 className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors bg-gray-800/80 hover:bg-gray-700 rounded-full p-2"
//               >
//                 <X className="w-5 h-5" />
//               </button>

//               <div className="p-8">
//                 <h2 className="text-2xl font-bold mb-8">Edit Personal Information</h2>

//                 <div className="space-y-6">
//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <Label htmlFor="fullName" className="text-sm text-gray-400 mb-2 block">
//                         Full Name
//                       </Label>
//                       <Input
//                         id="fullName"
//                         value={editFormData.fullName || ""}
//                         onChange={(e) => handleInputChange("fullName", e.target.value)}
//                         className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
//                         placeholder="Enter full name"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="phoneNumber" className="text-sm text-gray-400 mb-2 block">
//                         Phone Number
//                       </Label>
//                       <Input
//                         id="phoneNumber"
//                         value={editFormData.phoneNumber || ""}
//                         onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
//                         className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
//                         placeholder="Enter phone number"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-6">
//                     <div>
//                       <Label htmlFor="gender" className="text-sm text-gray-400 mb-2 block">
//                         Gender
//                       </Label>
//                       <Select
//                         value={editFormData.gender || ""}
//                         onValueChange={(value) => handleInputChange("gender", value || null)}
//                       >
//                         <SelectTrigger className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl">
//                           <SelectValue placeholder="Select gender" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-[#252836] border-gray-600">
//                           <SelectItem value="Male">Male</SelectItem>
//                           <SelectItem value="Female">Female</SelectItem>
//                           <SelectItem value="Other">Other</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div>
//                       <Label htmlFor="birthDay" className="text-sm text-gray-400 mb-2 block">
//                         Birth Date
//                       </Label>
//                       <Input
//                         id="birthDay"
//                         type="date"
//                         value={
//                           editFormData.birthDay
//                             ? new Date(editFormData.birthDay).toISOString().split("T")[0]
//                             : ""
//                         }
//                         onChange={(e) => handleInputChange("birthDay", e.target.value || null)}
//                         className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="bioDescription" className="text-sm text-gray-400 mb-2 block">
//                         Bio
//                       </Label>
//                       <textarea
//                         id="bioDescription"
//                         value={editFormData.bioDescription || ""}
//                         onChange={(e) => handleInputChange("bioDescription", e.target.value)}
//                         rows={4}
//                         placeholder="Write something about yourself..."
//                         className="w-full bg-[#1a1d2e] border border-gray-600 text-white p-4 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
//                       />
//                     </div>

//                   </div>

//                   {updateError && (
//                     <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
//                       <p className="text-red-400 text-sm">
//                         {typeof updateError === "string" ? updateError : "Error updating profile"}
//                       </p>
//                     </div>
//                   )}

//                   <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
//                     <Button
//                       variant="outline"
//                       onClick={() => {
//                         if (hasUnsavedChanges) {
//                           setShowUnsavedWarning(true);
//                         } else {
//                           setIsEditDialogOpen(false);
//                         }
//                       }}
//                       disabled={isUpdating}
//                       className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl px-6"
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       onClick={handleSaveChanges}
//                       disabled={isUpdating}
//                       className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6"
//                     >
//                       {isUpdating ? "Saving..." : "Save Changes"}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </DialogPanel>
//           </div>
//         </div>
//       </Dialog>

//       <Dialog
//         open={isChangePassDialogOpen}
//         as="div"
//         className="relative z-50"
//         onClose={setIsChangePassDialogOpen}
//       >
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <DialogPanel
//               transition
//               className="relative w-full max-w-md bg-[#252836] border border-gray-700 text-white rounded-2xl shadow-xl overflow-hidden duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
//             >
//               <button
//                 onClick={() => setIsChangePassDialogOpen(false)}
//                 className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-gray-800/80 hover:bg-gray-700 rounded-full p-2"
//               >
//                 <X className="w-5 h-5" />
//               </button>

//               <div className="p-8">
//                 <div className="flex items-center gap-3 mb-8">
//                   <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
//                     <Lock className="w-6 h-6" />
//                   </div>
//                   <h2 className="text-2xl font-bold">Change Password</h2>
//                 </div>

//                 <div className="space-y-5">
//                   <div>
//                     <Label htmlFor="oldPassword" className="text-sm text-gray-400 mb-2 block">
//                       Current Password
//                     </Label>
//                     <Input
//                       id="oldPassword"
//                       type="password"
//                       value={passwordData.oldPassword}
//                       onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
//                       className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
//                       placeholder="Enter current password"
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="newPassword" className="text-sm text-gray-400 mb-2 block">
//                       New Password
//                     </Label>
//                     <Input
//                       id="newPassword"
//                       type="password"
//                       value={passwordData.newPassword}
//                       onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
//                       className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
//                       placeholder="Enter new password"
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="confirmNewPassword" className="text-sm text-gray-400 mb-2 block">
//                       Confirm New Password
//                     </Label>
//                     <Input
//                       id="confirmNewPassword"
//                       type="password"
//                       value={passwordData.confirmNewPassword}
//                       onChange={(e) => handlePasswordChange("confirmNewPassword", e.target.value)}
//                       className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
//                       placeholder="Confirm new password"
//                     />
//                   </div>

//                   {changePasswordError && (
//                     <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
//                       <p className="text-red-400 text-sm">
//                         {typeof changePasswordError === "string"
//                           ? changePasswordError
//                           : "Error changing password"}
//                       </p>
//                     </div>
//                   )}

//                   <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
//                     <Button
//                       variant="outline"
//                       onClick={() => setIsChangePassDialogOpen(false)}
//                       disabled={isChanging}
//                       className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl px-6"
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       onClick={handleSavePassword}
//                       disabled={isChanging}
//                       className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6"
//                     >
//                       {isChanging ? "Changing..." : "Change Password"}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </DialogPanel>
//           </div>
//         </div>
//       </Dialog>

//       <Dialog
//         open={showUnsavedWarning}
//         as="div"
//         className="relative z-50"
//         onClose={() => setShowUnsavedWarning(false)}
//       >
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <DialogPanel
//               transition
//               className="relative w-full max-w-md bg-[#252836] border border-gray-700 text-white rounded-2xl shadow-xl overflow-hidden duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
//             >
//               <div className="p-8">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
//                     <AlertTriangle className="w-6 h-6" />
//                   </div>
//                   <h2 className="text-2xl font-bold">Unsaved Changes</h2>
//                 </div>

//                 <p className="text-gray-300 mb-8">
//                   You have unsaved changes. Are you sure you want to leave without saving?
//                 </p>

//                 <div className="flex justify-end gap-3">
//                   <Button
//                     variant="outline"
//                     onClick={() => setShowUnsavedWarning(false)}
//                     className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl px-6"
//                   >
//                     Continue Editing
//                   </Button>
//                   <Button
//                     onClick={() => {
//                       setShowUnsavedWarning(false);
//                       setIsEditDialogOpen(false);
//                       setHasUnsavedChanges(false);
//                       if (profile) {
//                         setEditFormData({
//                           fullName: profile.fullName || "",
//                           phoneNumber: profile.phoneNumber || "",
//                           gender: profile.gender as "Male" | "Female" | "Other" | null,
//                           bioDescription: profile.bioDescription || "",
//                           birthDay: profile.birthDay || null,
//                         });
//                       }
//                       setAvatarFile(null);
//                     }}
//                     className="bg-red-600 hover:bg-red-700 rounded-xl px-6"
//                   >
//                     Discard Changes
//                   </Button>
//                 </div>
//               </div>
//             </DialogPanel>
//           </div>
//         </div>
//       </Dialog>
//     </div >
//   );
// };

// export default EditProfileScreen;