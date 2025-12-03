
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
  // const [isOrcidLinked, setIsOrcidLinked] = useState(true);
  const [tempLocation, setTempLocation] = useState("");
  const [tempBio, setTempBio] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const [activeTab, setActiveTab] = useState<"profile" | "orcid">("profile");

  const mockOrcidData = {
    works: [
      {
        id: 1,
        title: "Machine Learning Applications in Medical Diagnosis",
        type: "Journal Article",
        date: "2024",
        journal: "Journal of Medical AI",
        doi: "10.1234/jmai.2024.001"
      },
      {
        id: 2,
        title: "Deep Learning for Image Recognition",
        type: "Conference Paper",
        date: "2023",
        conference: "CVPR 2023"
      }
    ],
    education: [
      {
        id: 1,
        degree: "Ph.D. in Computer Science",
        institution: "Stanford University",
        startYear: "2018",
        endYear: "2023"
      },
      {
        id: 2,
        degree: "M.Sc. in Artificial Intelligence",
        institution: "MIT",
        startYear: "2016",
        endYear: "2018"
      }
    ],
    biography: "Nhà nghiên cứu chuyên về Machine Learning và AI với hơn 5 năm kinh nghiệm trong lĩnh vực y tế số. Đã công bố hơn 20 bài báo khoa học trên các tạp chí uy tín quốc tế."
  };

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
        window.location.href = link; // Redirect sang ORCID
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
      <div className="min-h-screen bg-[#1a1d2e] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Không thể tải hồ sơ</h2>
          <p className="text-gray-400">Vui lòng đăng nhập để xem hồ sơ.</p>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#1a1d2e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-[#1a1d2e] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lỗi tải hồ sơ</h2>
          <p className="text-gray-400 mb-4">
            {profileError
              ? "Có lỗi xảy ra khi tải hồ sơ."
              : "Không tìm thấy thông tin hồ sơ."}
          </p>
          <Button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d2e] text-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

          {activeTab === "profile" && (
            <Button
              onClick={() => setIsChangePassDialogOpen(true)}
              className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </Button>
          )}

          {/* Tabs Navigation */}
          <div className="flex gap-2 border-b border-gray-700">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "profile"
                ? "text-blue-500"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              Profile & Settings
              {activeTab === "profile" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("orcid")}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "orcid"
                ? "text-blue-500"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              ORCID Information
              {activeTab === "orcid" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          </div>

          {hasUnsavedChanges && activeTab === "profile" && (
            <div className="mt-4 bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p>
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
                <div className="bg-[#252836] rounded-2xl p-8 space-y-8">
                  {/* Avatar Upload - giữ nguyên */}
                  <div className="flex items-start gap-6">
                    {/* ... existing avatar code ... */}
                  </div>

                  {/* Personal Info với Edit button mở Dialog */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Personal Info</h3>
                      <button
                        onClick={() => setIsEditDialogOpen(true)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-6 bg-[#1a1d2e] rounded-xl p-6">
                      <div>
                        <Label className="text-sm text-gray-400 mb-2 block">Full Name</Label>
                        <p className="text-white font-medium">{editFormData.fullName || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-400 mb-2 block">Email</Label>
                        <p className="text-white font-medium">{profile.email || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-400 mb-2 block">Phone</Label>
                        <p className="text-white font-medium">{editFormData.phoneNumber || "Not set"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section - CHỈ HIỂN THỊ, không cho edit trực tiếp */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Bio</h3>
                      <button
                        onClick={() => setIsEditDialogOpen(true)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                    <div className="bg-[#1a1d2e] rounded-xl p-6">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {editFormData.bioDescription || "No bio added yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Right Sidebar - Progress */}
              <section className="lg:col-span-5">
                <div className="bg-[#252836] rounded-2xl p-8 sticky top-6">
                  <h3 className="text-xl font-semibold mb-8">Complete your profile</h3>
                  <div className="flex justify-center mb-8">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="#2d3142"
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
                        <span className="text-4xl font-bold">{completionPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-white">Setup account</span>
                      </div>
                      <span className="text-sm text-gray-400">10%</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        {profile.avatarUrl ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-500" />
                        )}
                        <span className={profile.avatarUrl ? "text-white" : "text-gray-400"}>
                          Upload your photo
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">5%</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        {profile.phoneNumber ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-500" />
                        )}
                        <span className={profile.phoneNumber ? "text-white" : "text-gray-400"}>
                          Personal Info
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">10%</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        {profile.bioDescription ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-500" />
                        )}
                        <span className={profile.bioDescription ? "text-white" : "text-gray-400"}>
                          Biography
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">15%</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-white">Notifications</span>
                      </div>
                      <span className="text-sm text-green-400">+10%</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-400">Bank details</span>
                      </div>
                      <span className="text-sm text-green-400">+30%</span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Tab 2: ORCID Content - Full Width */}
              <section className="lg:col-span-12">
                <div className="bg-[#252836] rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-6 pb-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">ORCID Profile Information</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {isOrcidLinked
                            ? "Synced from your ORCID account"
                            : "Not linked to ORCID"}
                        </p>
                      </div>
                      {isOrcidLinked && (
                        <span className="text-xs bg-green-900 text-green-300 px-3 py-1 rounded-full border border-green-700">
                          Linked
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6 flex-1 overflow-y-auto">
                    {isLoadingOrcidStatus ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Đang kiểm tra trạng thái ORCID...</p>
                      </div>
                    ) : !isOrcidLinked ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-gray-500" />
                        </div>
                        <h4 className="text-lg font-medium mb-2">Chưa liên kết ORCID</h4>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                          Vui lòng liên kết tài khoản ORCID của bạn để đồng bộ thông tin học thuật,
                          công trình nghiên cứu và quá trình học tập.
                        </p>
                        <Button
                          onClick={handleOrcidLink}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Liên kết ORCID ngay
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Biography Section */}
                        <div className="bg-gray-800/50 rounded-lg p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                            <h4 className="text-base font-semibold">Tiểu sử</h4>
                          </div>
                          {isLoadingBio ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                              <p className="text-sm text-gray-400">Đang tải...</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {biographyData?.data || mockOrcidData.biography}
                            </p>
                          )}
                        </div>

                        {/* Works Section */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                            <h4 className="text-base font-semibold">
                              Công trình nghiên cứu
                              {!isLoadingWorks && worksData?.data && ` (${worksData.data.length || mockOrcidData.works.length})`}
                            </h4>
                          </div>
                          {isLoadingWorks ? (
                            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-4">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                              <p className="text-sm text-gray-400">Đang tải công trình...</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Sử dụng worksData?.data hoặc mockOrcidData.works */}
                              {/* {(worksData?.data || mockOrcidData.works).map((work: any) => (
                                <article
                                  key={work.id}
                                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700"
                                >
                                </article>
                              ))} */}
                            </div>
                          )}
                        </div>

                        {/* Education Section */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                            <h4 className="text-base font-semibold">
                              Quá trình học tập
                              {!isLoadingEdu && educationsData?.data && ` (${educationsData.data.length || mockOrcidData.education.length})`}
                            </h4>
                          </div>
                          {isLoadingEdu ? (
                            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-4">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                              <p className="text-sm text-gray-400">Đang tải quá trình học tập...</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Sử dụng educationsData?.data hoặc mockOrcidData.education */}
                              {/* {(educationsData?.data || mockOrcidData.education).map((edu: any) => (
                                <article
                                  key={edu.id}
                                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700"
                                >
                                </article>
                              ))} */}
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
        {/* <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsChangePassDialogOpen(true)}
                className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isUpdating || !hasUnsavedChanges}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
              >
                {isUpdating ? "Saving..." : "Save All Changes"}
              </Button>
            </div>
          </div>
          {hasUnsavedChanges && (
            <div className="mt-4 bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-300">
                Bạn có thay đổi chưa được lưu. Nhớ bấm nút "Save All Changes" để lưu thông tin.
              </p>
            </div>
          )}
        </header> */}

        {/* <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[#252836] rounded-2xl p-8 space-y-8">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName || "Profile"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                        {(profile.fullName || "U").charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">Upload new photo</h3>
                  <p className="text-sm text-gray-400 mb-4">
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
                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors text-sm font-medium"
                  >
                    Choose file
                  </label>
                  {avatarFile && (
                    <p className="text-green-400 text-sm mt-2">
                      Selected: {avatarFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Personal Info</h3>
                  <button
                    onClick={() => setIsEditDialogOpen(true)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 bg-[#1a1d2e] rounded-xl p-6">
                  <div>
                    <Label className="text-sm text-gray-400 mb-2 block">Full Name</Label>
                    <p className="text-white font-medium">{editFormData.fullName || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400 mb-2 block">Email</Label>
                    <p className="text-white font-medium">{profile.email || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400 mb-2 block">Phone</Label>
                    <p className="text-white font-medium">{editFormData.phoneNumber || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Location</h3>
                  {!isEditingLocation ? (
                    <button
                      onClick={() => {
                        setTempLocation(editFormData.bioDescription || "");
                        setIsEditingLocation(true);
                      }}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingLocation(false)}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {isEditingLocation ? (
                  <div className="bg-[#1a1d2e] rounded-xl p-6">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={tempLocation}
                          onChange={(e) => setTempLocation(e.target.value)}
                          placeholder="California"
                          className="bg-[#252836] border-gray-600 text-white pl-12 py-3 rounded-xl focus:border-blue-500"
                        />
                      </div>
                      <Button
                        onClick={handleSaveLocation}
                        className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
                      >
                        Save changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1a1d2e] rounded-xl p-6">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <p className="text-white">{editFormData.bioDescription || "Not set"}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Bio</h3>
                  {!isEditingBio ? (
                    <button
                      onClick={() => {
                        setTempBio(editFormData.bioDescription || "");
                        setIsEditingBio(true);
                      }}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {isEditingBio ? (
                  <div className="bg-[#1a1d2e] rounded-xl p-6">
                    <textarea
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      rows={6}
                      placeholder="Write something about yourself..."
                      className="w-full bg-[#252836] border border-gray-600 text-white p-4 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={handleSaveBio}
                        className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
                      >
                        Save changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1a1d2e] rounded-xl p-6">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {editFormData.bioDescription || "No bio added yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#252836] rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 pb-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">ORCID Profile Information</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {isOrcidLinked
                        ? "Synced from your ORCID account"
                        : "Not linked to ORCID"}
                    </p>
                  </div>
                  {isOrcidLinked && (
                    <span className="text-xs bg-green-900 text-green-300 px-3 py-1 rounded-full border border-green-700">
                      Linked
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                {!isOrcidLinked ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">Not linked to ORCID</h4>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Link your ORCID account to sync academic information, research works, and education history.
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Link ORCID Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                        <h4 className="text-base font-semibold">Biography</h4>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {mockOrcidData.biography}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                        <h4 className="text-base font-semibold">Research Works ({mockOrcidData.works.length})</h4>
                      </div>
                      <div className="space-y-3">
                        {mockOrcidData.works.map((work) => (
                          <article
                            key={work.id}
                            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-sm font-medium mb-2 leading-snug">
                                  {work.title}
                                </h5>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                  <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded">
                                    {work.type}
                                  </span>
                                  <span>•</span>
                                  <span>{work.date}</span>
                                  {work.journal && (
                                    <>
                                      <span>•</span>
                                      <span>{work.journal}</span>
                                    </>
                                  )}
                                  {work.conference && (
                                    <>
                                      <span>•</span>
                                      <span>{work.conference}</span>
                                    </>
                                  )}
                                </div>
                                {work.doi && (
                                  <p className="text-xs text-gray-500 mt-2">DOI: {work.doi}</p>
                                )}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                        <h4 className="text-base font-semibold">Education ({mockOrcidData.education.length})</h4>
                      </div>
                      <div className="space-y-3">
                        {mockOrcidData.education.map((edu) => (
                          <article
                            key={edu.id}
                            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-sm font-medium mb-1">
                                  {edu.degree}
                                </h5>
                                <p className="text-sm text-gray-400 mb-2">
                                  {edu.institution}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>{edu.startYear} - {edu.endYear}</span>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="lg:col-span-5">
            <div className="bg-[#252836] rounded-2xl p-8 sticky top-6">
              <h3 className="text-xl font-semibold mb-8">Complete your profile</h3>

              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#2d3142"
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
                    <span className="text-4xl font-bold">{completionPercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-white">Setup account</span>
                  </div>
                  <span className="text-sm text-gray-400">10%</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {profile.avatarUrl ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-500" />
                    )}
                    <span className={profile.avatarUrl ? "text-white" : "text-gray-400"}>
                      Upload your photo
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">5%</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {profile.phoneNumber ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-500" />
                    )}
                    <span className={profile.phoneNumber ? "text-white" : "text-gray-400"}>
                      Personal Info
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">10%</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {profile.bioDescription ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-500" />
                    )}
                    <span className={profile.bioDescription ? "text-white" : "text-gray-400"}>
                      Biography
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">15%</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-white">Notifications</span>
                  </div>
                  <span className="text-sm text-green-400">+10%</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-400">Bank details</span>
                  </div>
                  <span className="text-sm text-green-400">+30%</span>
                </div>
              </div>
            </div>
          </section>
        </main> */}
      </div>

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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              className="relative w-full max-w-2xl bg-[#252836] border border-gray-700 text-white rounded-2xl shadow-xl overflow-hidden duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
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
                className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors bg-gray-800/80 hover:bg-gray-700 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <h2 className="text-2xl font-bold mb-8">Edit Personal Information</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName" className="text-sm text-gray-400 mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={editFormData.fullName || ""}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm text-gray-400 mb-2 block">
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={editFormData.phoneNumber || ""}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="gender" className="text-sm text-gray-400 mb-2 block">
                        Gender
                      </Label>
                      <Select
                        value={editFormData.gender || ""}
                        onValueChange={(value) => handleInputChange("gender", value || null)}
                      >
                        <SelectTrigger className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#252836] border-gray-600">
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="birthDay" className="text-sm text-gray-400 mb-2 block">
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
                        className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bioDescription" className="text-sm text-gray-400 mb-2 block">
                        Bio
                      </Label>
                      <textarea
                        id="bioDescription"
                        value={editFormData.bioDescription || ""}
                        onChange={(e) => handleInputChange("bioDescription", e.target.value)}
                        rows={4}
                        placeholder="Write something about yourself..."
                        className="w-full bg-[#1a1d2e] border border-gray-600 text-white p-4 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>

                  </div>

                  {updateError && (
                    <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                      <p className="text-red-400 text-sm">
                        {typeof updateError === "string" ? updateError : "Error updating profile"}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
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
                      className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      disabled={isUpdating}
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6"
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

      <Dialog
        open={isChangePassDialogOpen}
        as="div"
        className="relative z-50"
        onClose={setIsChangePassDialogOpen}
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative w-full max-w-md bg-[#252836] border border-gray-700 text-white rounded-2xl shadow-xl overflow-hidden duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
            >
              <button
                onClick={() => setIsChangePassDialogOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-gray-800/80 hover:bg-gray-700 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Change Password</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="oldPassword" className="text-sm text-gray-400 mb-2 block">
                      Current Password
                    </Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
                      className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-sm text-gray-400 mb-2 block">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmNewPassword" className="text-sm text-gray-400 mb-2 block">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={passwordData.confirmNewPassword}
                      onChange={(e) => handlePasswordChange("confirmNewPassword", e.target.value)}
                      className="bg-[#1a1d2e] border-gray-600 text-white focus:border-blue-500 rounded-xl"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {changePasswordError && (
                    <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                      <p className="text-red-400 text-sm">
                        {typeof changePasswordError === "string"
                          ? changePasswordError
                          : "Error changing password"}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
                    <Button
                      variant="outline"
                      onClick={() => setIsChangePassDialogOpen(false)}
                      disabled={isChanging}
                      className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSavePassword}
                      disabled={isChanging}
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6"
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

      <Dialog
        open={showUnsavedWarning}
        as="div"
        className="relative z-50"
        onClose={() => setShowUnsavedWarning(false)}
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative w-full max-w-md bg-[#252836] border border-gray-700 text-white rounded-2xl shadow-xl overflow-hidden duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Unsaved Changes</h2>
                </div>

                <p className="text-gray-300 mb-8">
                  You have unsaved changes. Are you sure you want to leave without saving?
                </p>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowUnsavedWarning(false)}
                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 rounded-xl px-6"
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
                    className="bg-red-600 hover:bg-red-700 rounded-xl px-6"
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
// import { Edit, Mail, Phone, MapPin, Calendar, Users, X } from "lucide-react";
// import { useAuth } from "@/redux/hooks/useAuth";
// import { useProfile } from "@/redux/hooks/useProfile";

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

//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [editFormData, setEditFormData] = useState<
//     Partial<UserProfileResponse>
//   >({
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
//   const [isOrcidLinked, setIsOrcidLinked] = useState(true);

//   const mockOrcidData = {
//     works: [
//       {
//         id: 1,
//         title: "Machine Learning Applications in Medical Diagnosis",
//         type: "Journal Article",
//         date: "2024",
//         journal: "Journal of Medical AI",
//         doi: "10.1234/jmai.2024.001"
//       },
//       {
//         id: 2,
//         title: "Deep Learning for Image Recognition",
//         type: "Conference Paper",
//         date: "2023",
//         conference: "CVPR 2023"
//       }
//     ],
//     education: [
//       {
//         id: 1,
//         degree: "Ph.D. in Computer Science",
//         institution: "Stanford University",
//         startYear: "2018",
//         endYear: "2023"
//       },
//       {
//         id: 2,
//         degree: "M.Sc. in Artificial Intelligence",
//         institution: "MIT",
//         startYear: "2016",
//         endYear: "2018"
//       }
//     ],
//     biography: "Nhà nghiên cứu chuyên về Machine Learning và AI với hơn 5 năm kinh nghiệm trong lĩnh vực y tế số. Đã công bố hơn 20 bài báo khoa học trên các tạp chí uy tín quốc tế."
//   };

//   // Load profile data when component mounts or when profile changes
//   useEffect(() => {
//     if (profile) {
//       setEditFormData({
//         fullName: profile.fullName || "",
//         phoneNumber: profile.phoneNumber || "",
//         gender: profile.gender as "Male" | "Female" | "Other" | null,
//         bioDescription: profile.bioDescription || "",
//         birthDay: profile.birthDay || null,
//       });
//     }
//   }, [profile]);

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
//         // fullName: editFormData.fullName,
//         // phoneNumber: editFormData.phoneNumber,
//         // gender: editFormData.gender as 'Male' | 'Female' | 'Other' | undefined,
//         // bioDescription: editFormData.bioDescription,
//         // birthDay: editFormData.birthDay,
//         // avatarFile: avatarFile || undefined
//       };

//       await updateProfile(updateData);
//       alert("Cập nhật hồ sơ thành công!");
//       setIsEditDialogOpen(false);
//       setAvatarFile(null);
//     } catch (error: unknown) {
//       const errorMessage = "Có lỗi xảy ra khi cập nhật hồ sơ";

//       // if (error?.data?.Message) {
//       //   errorMessage = error.data.Message
//       // } else if (error?.data?.Errors) {
//       //   const errors = Object.values(error.data.Errors)
//       //   errorMessage = errors.length > 0 ? errors[0] as string : errorMessage
//       // }

//       alert(errorMessage);
//     }
//   };

//   const handleCancel = () => {
//     if (profile) {
//       setEditFormData({
//         fullName: profile.fullName || "",
//         phoneNumber: profile.phoneNumber || "",
//         gender: profile.gender as "Male" | "Female" | "Other" | null,
//         bioDescription: profile.bioDescription || "",
//         birthDay: profile.birthDay || null,
//       });
//     }
//     setAvatarFile(null);
//     setIsEditDialogOpen(false);
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

//       // if (error?.data?.Message) {
//       //   errorMessage = error.data.Message
//       // } else if (error?.data?.Errors) {
//       //   const errors = Object.values(error.data.Errors)
//       //   errorMessage = errors.length > 0 ? errors[0] as string : errorMessage
//       // }

//       alert(errorMessage);
//     }
//   };

//   const handleCancelPassword = () => {
//     setPasswordData({
//       oldPassword: "",
//       newPassword: "",
//       confirmNewPassword: "",
//     });
//     setIsChangePassDialogOpen(false);
//   };

//   if (!userId) {
//     return (
//       <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold mb-2">Không thể tải hồ sơ</h2>
//           <p className="text-gray-400">Vui lòng đăng nhập để xem hồ sơ.</p>
//         </div>
//       </div>
//     );
//   }

//   if (profileLoading) {
//     return (
//       <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-400">Đang tải hồ sơ...</p>
//         </div>
//       </div>
//     );
//   }

//   if (profileError || !profile) {
//     return (
//       <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
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
//     <div className="min-h-screen bg-gray-950 text-white">
//       <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <header className="mb-8">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
//               <h1 className="text-2xl lg:text-3xl font-bold">
//                 Hồ sơ người dùng
//               </h1>
//               {/* <span className="text-sm text-gray-400">
//                   Responded 2 discussion in 1 Property
//                 </span> */}
//             </div>
//             <div className="flex justify-start sm:justify-end">
//               <Button
//                 onClick={() => setIsEditDialogOpen(true)}
//                 className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2"
//               >
//                 <Edit className="w-4 h-4" />
//                 <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
//                 <span className="sm:hidden">Sửa</span>
//               </Button>

//               <Button
//                 onClick={() => setIsChangePassDialogOpen(true)}
//                 className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 ml-2"
//               >
//                 <span>Đổi mật khẩu</span>
//               </Button>
//             </div>

//             <Button
//               onClick={() => setIsChangePassDialogOpen(true)}
//               className="bg-gray-800 hover:bg-gray-900 text-white"
//             >
//               Liên kết ORCID
//             </Button>
//           </div>
//         </header>

//         <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
//           <section className="xl:col-span-4">
//             <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
//               <div className="p-6 pb-4">
//                 <div className="flex flex-col items-center text-center">
//                   <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 overflow-hidden">
//                     {profile.avatarUrl ? (
//                       <img
//                         src={profile.avatarUrl}
//                         alt={profile.fullName || "Profile"}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       (profile.fullName || "U")
//                         .split(" ")
//                         .map((n) => n[0])
//                         .join("")
//                     )}
//                   </div>
//                   <h2 className="text-xl font-semibold mb-2">
//                     {profile.fullName || "Chưa cập nhật"}
//                   </h2>
//                   <p className="text-gray-400 mb-3 break-all">
//                     {profile.email || "Chưa cập nhật"}
//                   </p>
//                   <div className="flex flex-wrap items-center justify-center gap-2">
//                     {profile.gender && (
//                       <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300 border border-blue-700">
//                         {profile.gender === "Male"
//                           ? "Nam"
//                           : profile.gender === "Female"
//                             ? "Nữ"
//                             : "Khác"}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="px-6 pb-6">
//                 <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">
//                   Thông tin liên hệ
//                 </h3>
//                 <div className="space-y-4">
//                   <div className="flex items-start gap-3">
//                     <div className="flex-shrink-0 mt-0.5">
//                       <Mail className="w-4 h-4 text-gray-400" />
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <p className="text-xs text-gray-400 mb-1">Email</p>
//                       <p className="text-sm break-all">
//                         {profile.email || "Chưa cập nhật"}
//                       </p>
//                     </div>
//                   </div>

//                   {profile.phoneNumber && (
//                     <div className="flex items-start gap-3">
//                       <div className="flex-shrink-0 mt-0.5">
//                         <Phone className="w-4 h-4 text-gray-400" />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="text-xs text-gray-400 mb-1">
//                           Số điện thoại
//                         </p>
//                         <p className="text-sm">{profile.phoneNumber}</p>
//                       </div>
//                     </div>
//                   )}

//                   {profile.bioDescription && (
//                     <div className="flex items-start gap-3">
//                       <div className="flex-shrink-0 mt-0.5">
//                         <MapPin className="w-4 h-4 text-gray-400" />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="text-xs text-gray-400 mb-1">Mô tả</p>
//                         <p className="text-sm leading-relaxed">
//                           {profile.bioDescription}
//                         </p>
//                       </div>
//                     </div>
//                   )}

//                   {profile.birthDay && (
//                     <div className="flex items-start gap-3">
//                       <div className="flex-shrink-0 mt-0.5">
//                         <Calendar className="w-4 h-4 text-gray-400" />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="text-xs text-gray-400 mb-1">Ngày sinh</p>
//                         <p className="text-sm">
//                           {new Date(profile.birthDay).toLocaleDateString(
//                             "vi-VN",
//                           )}
//                         </p>
//                       </div>
//                     </div>
//                   )}

//                   {profile.userId && (
//                     <div className="flex items-start gap-3">
//                       <div className="flex-shrink-0 mt-0.5">
//                         <Users className="w-4 h-4 text-gray-400" />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="text-xs text-gray-400 mb-1">User ID</p>
//                         <p className="text-sm font-medium">{profile.userId}</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </section>

//           <section className="xl:col-span-8">
//             <div className="bg-gray-900 border border-gray-700 rounded-lg">
//               <div className="p-6 pb-4 border-b border-gray-700">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold">Thông tin từ hồ sơ học thuật ORCID</h3>
//                     <p className="text-sm text-gray-400 mt-1">
//                       {isOrcidLinked
//                         ? "Các thông tin được đồng bộ từ ORCID"
//                         : "Chưa liên kết với tài khoản ORCID"}
//                     </p>
//                   </div>
//                   {isOrcidLinked && (
//                     <span className="text-xs bg-green-900 text-green-300 px-3 py-1 rounded-full border border-green-700">
//                       Đã liên kết
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <div className="p-6">
//                 {!isOrcidLinked ? (
//                   // Trường hợp chưa liên kết ORCID
//                   <div className="text-center py-12">
//                     <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
//                       <Users className="w-8 h-8 text-gray-500" />
//                     </div>
//                     <h4 className="text-lg font-medium mb-2">Chưa liên kết ORCID</h4>
//                     <p className="text-gray-400 mb-6 max-w-md mx-auto">
//                       Vui lòng liên kết tài khoản ORCID của bạn để đồng bộ thông tin học thuật,
//                       công trình nghiên cứu và quá trình học tập.
//                     </p>
//                     <Button
//                       onClick={() => setIsChangePassDialogOpen(true)}
//                       className="bg-green-600 hover:bg-green-700"
//                     >
//                       Liên kết ORCID ngay
//                     </Button>
//                   </div>
//                 ) : (
//                   // Trường hợp đã liên kết ORCID - 3 sections
//                   <div className="space-y-6">
//                     {/* Biography Section */}
//                     <div className="bg-gray-800/50 rounded-lg p-5">
//                       <div className="flex items-center gap-2 mb-3">
//                         <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
//                         <h4 className="text-base font-semibold">Tiểu sử</h4>
//                       </div>
//                       <p className="text-sm text-gray-300 leading-relaxed">
//                         {mockOrcidData.biography}
//                       </p>
//                     </div>

//                     {/* Works Section */}
//                     <div>
//                       <div className="flex items-center gap-2 mb-4">
//                         <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
//                         <h4 className="text-base font-semibold">Công trình nghiên cứu ({mockOrcidData.works.length})</h4>
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

//                     {/* Education Section */}
//                     <div>
//                       <div className="flex items-center gap-2 mb-4">
//                         <div className="w-1 h-5 bg-green-500 rounded-full"></div>
//                         <h4 className="text-base font-semibold">Quá trình học tập ({mockOrcidData.education.length})</h4>
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
//           {/* <section className="xl:col-span-8">
//             <div className="bg-gray-900 border border-gray-700 rounded-lg">

//               <div className="p-6 pb-4 border-b border-gray-700">
//                 <h3 className="text-lg font-semibold">Thông tin từ hồ sơ học thuật ORCID của bạn</h3>
//                 <p className="text-sm text-gray-400 mt-1">Các thông tin được đồng bộ từ ORCID</p>
//               </div>

//               <div className="p-6">
//                 <div className="space-y-4">
//                   <article className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
//                     <div className="flex items-start gap-3">
//                       <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
//                       <div className="min-w-0 flex-1">
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-2">
//                           <p className="text-sm font-medium">Responded 2 discussion in 1 Property</p>
//                           <time className="text-xs text-gray-400 whitespace-nowrap">24 August, 19:31</time>
//                         </div>
//                         <p className="text-sm text-gray-300 leading-relaxed">
//                           In order for a person (legal or natural) to sell property in CA the land,
//                           building or both should meet a series of conditions such as: the...
//                         </p>
//                       </div>
//                     </div>
//                   </article>

//                   <article className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
//                     <div className="flex items-start gap-3">
//                       <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
//                       <div className="min-w-0 flex-1">
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-2">
//                           <div className="flex flex-wrap items-center gap-2">
//                             <span className="text-sm font-medium">Seller list August 2024</span>
//                             <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded border border-yellow-700">
//                               Shortlisted
//                             </span>
//                           </div>
//                           <time className="text-xs text-gray-400 whitespace-nowrap">24 August, 19:31</time>
//                         </div>
//                       </div>
//                     </div>
//                   </article>

//                   <article className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
//                     <div className="flex items-start gap-3">
//                       <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
//                       <div className="min-w-0 flex-1">
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-2">
//                           <p className="text-sm font-medium">Status changed to Done</p>
//                           <time className="text-xs text-gray-400 whitespace-nowrap">24 August, 19:31</time>
//                         </div>
//                       </div>
//                     </div>
//                   </article>
//                 </div>
//               </div>
//             </div>
//           </section> */}
//         </main>
//       </div>

//       <Dialog
//         open={isEditDialogOpen}
//         as="div"
//         className="relative z-50"
//         onClose={setIsEditDialogOpen}
//       >
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <DialogPanel
//               className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl bg-gray-900 border border-gray-700 text-white overflow-hidden max-h-[90vh] overflow-y-auto rounded-lg shadow-xl duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
//               // data-open
//               transition
//               style={{
//                 scrollbarWidth: "none",
//                 msOverflowStyle: "none",
//               }}
//             >
//               <button
//                 onClick={() => setIsEditDialogOpen(false)}
//                 className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 text-gray-400 hover:text-white transition-colors bg-gray-800/80 hover:bg-gray-700 rounded-full p-1"
//               >
//                 <X className="w-4 h-4 sm:w-5 sm:h-5" />
//               </button>

//               <header className="relative h-24 sm:h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 overflow-hidden">
//                 <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-pink-600/80"></div>
//               </header>

//               {/* Content */}
//               <div className="relative px-4 sm:px-6 -mt-6 sm:-mt-8">
//                 {/* Profile Info Section */}
//                 <section className="mb-6">
//                   <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
//                     <div className="flex-shrink-0 self-center sm:self-auto">
//                       <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold border-4 border-gray-900 overflow-hidden">
//                         {profile.avatarUrl ? (
//                           <img
//                             src={profile.avatarUrl}
//                             alt={profile.fullName || "Profile"}
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           (editFormData.fullName || "U")
//                             .split(" ")
//                             .map((n) => n[0])
//                             .join("")
//                         )}
//                       </div>
//                     </div>
//                     <div className="text-center sm:text-left min-w-0 flex-1">
//                       <h2 className="text-lg sm:text-xl font-semibold truncate">
//                         {editFormData.fullName || "Chưa cập nhật"}
//                       </h2>
//                       <p className="text-sm text-gray-400 truncate">
//                         {profile.email || "Chưa cập nhật"}
//                       </p>
//                       <div className="flex justify-center sm:justify-start items-center gap-2 mt-1">
//                         {profile.gender && (
//                           <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded border border-blue-700">
//                             {profile.gender === "Male"
//                               ? "Nam"
//                               : profile.gender === "Female"
//                                 ? "Nữ"
//                                 : "Khác"}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </section>

//                 {/* Stats Section */}
//                 <section className="mb-6">
//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-center bg-gray-800/50 rounded-lg p-3 sm:p-4">
//                     <div>
//                       <p className="text-xs text-gray-400">User ID</p>
//                       <p className="text-xs sm:text-sm font-medium truncate">
//                         {profile.userId || "N/A"}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-400">Giới tính</p>
//                       <p className="text-xs sm:text-sm font-medium">
//                         {profile.gender === "Male"
//                           ? "Nam"
//                           : profile.gender === "Female"
//                             ? "Nữ"
//                             : profile.gender === "Other"
//                               ? "Khác"
//                               : "Chưa cập nhật"}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-400">Ngày sinh</p>
//                       <p className="text-xs sm:text-sm font-medium">
//                         {profile.birthDay
//                           ? new Date(profile.birthDay).toLocaleDateString(
//                             "vi-VN",
//                           )
//                           : "Chưa cập nhật"}
//                       </p>
//                     </div>
//                   </div>
//                 </section>

//                 {/* Edit Form Section */}
//                 <section className="pb-6 space-y-4">
//                   {/* Personal Info */}
//                   <fieldset>
//                     <legend className="text-sm font-medium text-gray-300 mb-3">
//                       Thông tin cá nhân
//                     </legend>
//                     <div className="space-y-3">
//                       <div>
//                         <Label
//                           htmlFor="fullName"
//                           className="text-sm text-gray-300"
//                         >
//                           Họ và tên
//                         </Label>
//                         <Input
//                           id="fullName"
//                           value={editFormData.fullName || ""}
//                           onChange={(e) =>
//                             handleInputChange("fullName", e.target.value)
//                           }
//                           className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
//                           placeholder="Nhập họ và tên"
//                         />
//                       </div>
//                       <div>
//                         <Label
//                           htmlFor="phoneNumber"
//                           className="text-sm text-gray-300"
//                         >
//                           Số điện thoại
//                         </Label>
//                         <Input
//                           id="phoneNumber"
//                           value={editFormData.phoneNumber || ""}
//                           onChange={(e) =>
//                             handleInputChange("phoneNumber", e.target.value)
//                           }
//                           className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
//                           placeholder="Nhập số điện thoại"
//                         />
//                       </div>
//                       <div>
//                         <Label
//                           htmlFor="gender"
//                           className="text-sm text-gray-300"
//                         >
//                           Giới tính
//                         </Label>
//                         <Select
//                           value={editFormData.gender || ""}
//                           onValueChange={(value) =>
//                             handleInputChange("gender", value || null)
//                           }
//                         >
//                           <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-blue-500">
//                             <SelectValue placeholder="Chọn giới tính" />
//                           </SelectTrigger>
//                           <SelectContent className="bg-gray-800 border-gray-600">
//                             <SelectItem value="Male">Nam</SelectItem>
//                             <SelectItem value="Female">Nữ</SelectItem>
//                             <SelectItem value="Other">Khác</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div>
//                         <Label
//                           htmlFor="birthDay"
//                           className="text-sm text-gray-300"
//                         >
//                           Ngày sinh
//                         </Label>
//                         <Input
//                           id="birthDay"
//                           type="date"
//                           value={
//                             editFormData.birthDay
//                               ? new Date(editFormData.birthDay)
//                                 .toISOString()
//                                 .split("T")[0]
//                               : ""
//                           }
//                           onChange={(e) =>
//                             handleInputChange(
//                               "birthDay",
//                               e.target.value || null,
//                             )
//                           }
//                           className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
//                         />
//                       </div>
//                       <div>
//                         <Label
//                           htmlFor="bioDescription"
//                           className="text-sm text-gray-300"
//                         >
//                           Mô tả
//                         </Label>
//                         <Input
//                           id="bioDescription"
//                           value={editFormData.bioDescription || ""}
//                           onChange={(e) =>
//                             handleInputChange("bioDescription", e.target.value)
//                           }
//                           className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
//                           placeholder="Nhập mô tả về bản thân"
//                         />
//                       </div>
//                       <div>
//                         <Label
//                           htmlFor="avatar"
//                           className="text-sm text-gray-300"
//                         >
//                           Ảnh đại diện
//                         </Label>
//                         <Input
//                           id="avatar"
//                           type="file"
//                           accept="image/*"
//                           onChange={handleAvatarChange}
//                           className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
//                         />
//                         {avatarFile && (
//                           <p className="text-green-400 text-sm mt-1">
//                             Đã chọn: {avatarFile.name}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </fieldset>

//                   {/* Error Display */}
//                   {updateError && (
//                     <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
//                       <p className="text-red-400 text-sm">
//                         {typeof updateError === "string"
//                           ? updateError
//                           : "Có lỗi xảy ra khi cập nhật hồ sơ"}
//                       </p>
//                     </div>
//                   )}

//                   {/* Action Buttons */}
//                   <footer className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
//                     <Button
//                       variant="outline"
//                       onClick={handleCancel}
//                       disabled={isUpdating}
//                       className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       Hủy
//                     </Button>
//                     <Button
//                       onClick={handleSaveChanges}
//                       disabled={isUpdating}
//                       className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white transition-colors"
//                     >
//                       {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
//                     </Button>
//                   </footer>
//                 </section>
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
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <DialogPanel
//               transition
//               className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg bg-gray-900 border border-gray-700 text-white rounded-lg shadow-xl overflow-hidden duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
//             >
//               <button
//                 onClick={() => setIsChangePassDialogOpen(false)}
//                 className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors bg-gray-800/80 hover:bg-gray-700 rounded-full p-1"
//               >
//                 <X className="w-5 h-5" />
//               </button>

//               <header className="h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
//                 <h2 className="text-lg sm:text-xl font-semibold">
//                   Đổi mật khẩu
//                 </h2>
//               </header>

//               <div className="px-6 py-6 space-y-5">
//                 <div>
//                   <Label
//                     htmlFor="oldPassword"
//                     className="text-sm text-gray-300"
//                   >
//                     Mật khẩu hiện tại
//                   </Label>
//                   <Input
//                     id="oldPassword"
//                     type="password"
//                     value={passwordData.oldPassword}
//                     onChange={(e) =>
//                       handlePasswordChange("oldPassword", e.target.value)
//                     }
//                     className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
//                   />
//                 </div>

//                 <div>
//                   <Label
//                     htmlFor="newPassword"
//                     className="text-sm text-gray-300"
//                   >
//                     Mật khẩu mới
//                   </Label>
//                   <Input
//                     id="newPassword"
//                     type="password"
//                     value={passwordData.newPassword}
//                     onChange={(e) =>
//                       handlePasswordChange("newPassword", e.target.value)
//                     }
//                     className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
//                   />
//                 </div>

//                 <div>
//                   <Label
//                     htmlFor="confirmNewPassword"
//                     className="text-sm text-gray-300"
//                   >
//                     Xác nhận mật khẩu mới
//                   </Label>
//                   <Input
//                     id="confirmNewPassword"
//                     type="password"
//                     value={passwordData.confirmNewPassword}
//                     onChange={(e) =>
//                       handlePasswordChange("confirmNewPassword", e.target.value)
//                     }
//                     className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
//                   />
//                 </div>

//                 {/* Error Display */}
//                 {changePasswordError && (
//                   <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
//                     <p className="text-red-400 text-sm">
//                       {typeof changePasswordError === "string"
//                         ? changePasswordError
//                         : "Có lỗi xảy ra khi đổi mật khẩu"}
//                     </p>
//                   </div>
//                 )}

//                 <footer className="flex flex-col sm:flex-row justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
//                   <Button
//                     variant="outline"
//                     onClick={handleCancelPassword}
//                     disabled={isChanging}
//                     className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     Hủy
//                   </Button>
//                   <Button
//                     onClick={handleSavePassword}
//                     disabled={isChanging}
//                     className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white transition-colors"
//                   >
//                     {isChanging ? "Đang đổi..." : "Đổi mật khẩu"}
//                   </Button>
//                 </footer>
//               </div>
//             </DialogPanel>
//           </div>
//         </div>
//       </Dialog>

//       {/* <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>

//        </Dialog> */}
//     </div>
//   );
// };

// export default EditProfileScreen;