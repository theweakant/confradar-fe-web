"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogPanel, } from '@headlessui/react'
import { User } from '@/types/user.type'
import { Edit, Mail, Phone, MapPin, Calendar, Users, X } from 'lucide-react'

const mockUser: User = {
  userId: "USER001",
  fullName: "Denis Mendoza",
  email: "denis.mendoza@email.com",
  phoneNumber: "+1 (555) 203 923",
  address: "134 Baker Street, San Diego, CA 92093, USA",
  role: "reviewer",
  status: "active",
  registeredConferences: 5,
  joinedDate: "17 Aug 2019"
}


const EditProfileScreen: React.FC = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    fullName: mockUser.fullName,
    email: mockUser.email,
    phoneNumber: mockUser.phoneNumber,
    address: mockUser.address,
    role: mockUser.role,
    status: mockUser.status
  })

  const [isChangePassDialogOpen, setIsChangePassDialogOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveChanges = () => {
    console.log('Saving changes:', editFormData)
    setIsEditDialogOpen(false)
  }

  const handleCancel = () => {
    setEditFormData({
      fullName: mockUser.fullName,
      email: mockUser.email,
      phoneNumber: mockUser.phoneNumber,
      address: mockUser.address,
      role: mockUser.role,
      status: mockUser.status
    })
    setIsEditDialogOpen(false)
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleSavePassword = () => {
    console.log('Password change data:', passwordData)
    // TODO: gọi API đổi mật khẩu ở đây
    setIsChangePassDialogOpen(false)
  }

  const handleCancelPassword = () => {
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setIsChangePassDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold">Hồ sơ người dùng</h1>
              {/* <span className="text-sm text-gray-400">
                  Responded 2 discussion in 1 Property
                </span> */}
            </div>
            <div className="flex justify-start sm:justify-end">
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
                <span className="sm:hidden">Sửa</span>
              </Button>

              <Button
                onClick={() => setIsChangePassDialogOpen(true)}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 ml-2"
              >
                <span>Đổi mật khẩu</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

          {/* Left Column - User Profile Card */}
          <section className="xl:col-span-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">

              {/* Profile Header */}
              <div className="p-6 pb-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mb-4">
                    {mockUser.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{mockUser.fullName}</h2>
                  <p className="text-gray-400 mb-3 break-all">{mockUser.email}</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${mockUser.status === 'active'
                      ? 'bg-green-900 text-green-300 border border-green-700'
                      : 'bg-red-900 text-red-300 border border-red-700'
                      }`}>
                      {mockUser.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300 border border-blue-700">
                      {mockUser.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="px-6 pb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Thông tin liên hệ</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 mb-1">Email</p>
                      <p className="text-sm break-all">{mockUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 mb-1">Số điện thoại</p>
                      <p className="text-sm">{mockUser.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 mb-1">Địa chỉ</p>
                      <p className="text-sm leading-relaxed">{mockUser.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 mb-1">Ngày tham gia</p>
                      <p className="text-sm">{mockUser.joinedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 mb-1">Số hội nghị đã đăng ký</p>
                      <p className="text-sm font-medium">{mockUser.registeredConferences}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column - Activity Feed */}
          <section className="xl:col-span-8">
            <div className="bg-gray-900 border border-gray-700 rounded-lg">

              {/* Activity Header */}
              <div className="p-6 pb-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Hoạt động gần đây</h3>
                <p className="text-sm text-gray-400 mt-1">Nhật ký các hoạt động của người dùng</p>
              </div>

              {/* Activity List */}
              <div className="p-6">
                <div className="space-y-4">
                  <article className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-2">
                          <p className="text-sm font-medium">Responded 2 discussion in 1 Property</p>
                          <time className="text-xs text-gray-400 whitespace-nowrap">24 August, 19:31</time>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          In order for a person (legal or natural) to sell property in CA the land,
                          building or both should meet a series of conditions such as: the...
                        </p>
                      </div>
                    </div>
                  </article>

                  <article className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">Seller list August 2024</span>
                            <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded border border-yellow-700">
                              Shortlisted
                            </span>
                          </div>
                          <time className="text-xs text-gray-400 whitespace-nowrap">24 August, 19:31</time>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-2">
                          <p className="text-sm font-medium">Status changed to Done</p>
                          <time className="text-xs text-gray-400 whitespace-nowrap">24 August, 19:31</time>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog
        open={isEditDialogOpen}
        as="div"
        className="relative z-50"
        onClose={setIsEditDialogOpen}
      >
        {/* Backdrop */}

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Panel Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl bg-gray-900 border border-gray-700 text-white overflow-hidden max-h-[90vh] overflow-y-auto rounded-lg shadow-xl duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
              // data-open
              transition
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {/* Custom Close Button */}
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 text-gray-400 hover:text-white transition-colors bg-gray-800/80 hover:bg-gray-700 rounded-full p-1"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Header Gradient */}
              <header className="relative h-24 sm:h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-pink-600/80"></div>
              </header>

              {/* Content */}
              <div className="relative px-4 sm:px-6 -mt-6 sm:-mt-8">
                {/* Profile Info Section */}
                <section className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex-shrink-0 self-center sm:self-auto">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold border-4 border-gray-900">
                        {editFormData.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="text-center sm:text-left min-w-0 flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold truncate">{editFormData.fullName}</h2>
                      <p className="text-sm text-gray-400 truncate">{editFormData.email}</p>
                      <div className="flex justify-center sm:justify-start items-center gap-2 mt-1">
                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded border border-green-700">
                          ✓ Subscribed
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Stats Section */}
                <section className="mb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center bg-gray-800/50 rounded-lg p-3 sm:p-4">
                    <div>
                      <p className="text-xs text-gray-400">First seen</p>
                      <p className="text-xs sm:text-sm font-medium truncate">{mockUser.joinedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Conferences</p>
                      <p className="text-xs sm:text-sm font-medium">{mockUser.registeredConferences}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Revenue</p>
                      <p className="text-xs sm:text-sm font-medium">$0.00</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Status</p>
                      <p className="text-xs sm:text-sm font-medium capitalize">{mockUser.status}</p>
                    </div>
                  </div>
                </section>

                {/* Edit Form Section */}
                <section className="pb-6 space-y-4">
                  {/* Personal Info */}
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-300 mb-3">Thông tin cá nhân</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName" className="text-sm text-gray-300">Họ</Label>
                        <Input
                          id="firstName"
                          value={editFormData.fullName.split(' ')[0]}
                          onChange={(e) => {
                            const lastName = editFormData.fullName.split(' ').slice(1).join(' ')
                            handleInputChange('fullName', `${e.target.value} ${lastName}`)
                          }}
                          className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm text-gray-300">Tên</Label>
                        <Input
                          id="lastName"
                          value={editFormData.fullName.split(' ').slice(1).join(' ')}
                          onChange={(e) => {
                            const firstName = editFormData.fullName.split(' ')[0]
                            handleInputChange('fullName', `${firstName} ${e.target.value}`)
                          }}
                          className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Contact Info */}
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-300 mb-3">Thông tin liên hệ</legend>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="email" className="text-sm text-gray-300">Email</Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white pl-10 focus:border-blue-500 transition-colors"
                          />
                          <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-white">✓</span>
                          </div>
                          <span className="text-xs text-gray-400">ĐÃ XÁC THỰC 2 THÁNG 1, 2025</span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-sm text-gray-300">Số điện thoại</Label>
                        <Input
                          id="phone"
                          value={editFormData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-sm text-gray-300">Địa chỉ</Label>
                        <Input
                          id="address"
                          value={editFormData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Account Settings */}
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-300 mb-3">Cài đặt tài khoản</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="role" className="text-sm text-gray-300">Vai trò</Label>
                        <Select value={editFormData.role} onValueChange={(value) => handleInputChange('role', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="admin">Quản trị viên</SelectItem>
                            <SelectItem value="organizer">Người tổ chức</SelectItem>
                            <SelectItem value="attendee">Người tham dự</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="status" className="text-sm text-gray-300">Trạng thái</Label>
                        <Select value={editFormData.status} onValueChange={(value) => handleInputChange('status', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="active">Hoạt động</SelectItem>
                            <SelectItem value="inactive">Không hoạt động</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </fieldset>

                  {/* Action Buttons */}
                  <footer className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      Lưu thay đổi
                    </Button>
                  </footer>
                </section>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg bg-gray-900 border border-gray-700 text-white rounded-lg shadow-xl overflow-hidden duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
            >
              <button
                onClick={() => setIsChangePassDialogOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors bg-gray-800/80 hover:bg-gray-700 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <header className="h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
                <h2 className="text-lg sm:text-xl font-semibold">Đổi mật khẩu</h2>
              </header>

              <div className="px-6 py-6 space-y-5">
                <div>
                  <Label htmlFor="oldPassword" className="text-sm text-gray-300">Mật khẩu hiện tại</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-sm text-gray-300">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm text-gray-300">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 transition-colors"
                  />
                </div>

                <footer className="flex flex-col sm:flex-row justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={handleCancelPassword}
                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSavePassword}
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    Lưu thay đổi
                  </Button>
                </footer>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>

       </Dialog> */}
    </div>
  )
}

export default EditProfileScreen

// "use client"

// import React, { useState } from 'react'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Dialog, DialogPanel } from '@headlessui/react'
// import { User } from '@/types/user.type'
// import { Edit, Mail, Phone, MapPin, Calendar, Users, X } from 'lucide-react'

// const mockUser: User = {
//   userId: "USER001",
//   fullName: "Denis Mendoza",
//   email: "denis.mendoza@email.com",
//   phoneNumber: "+1 (555) 203 923",
//   address: "134 Baker Street, San Diego, CA 92093, USA",
//   role: "reviewer",
//   status: "active",
//   registeredConferences: 5,
//   joinedDate: "17 Aug 2019"
// }

// const EditProfileScreen: React.FC = () => {
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
//   const [editFormData, setEditFormData] = useState({
//     fullName: mockUser.fullName,
//     email: mockUser.email,
//     phoneNumber: mockUser.phoneNumber,
//     address: mockUser.address,
//     role: mockUser.role,
//     status: mockUser.status
//   })

//   const [isChangePassOpen, setIsChangePassOpen] = useState(false)
//   const [passwordForm, setPasswordForm] = useState({
//     oldPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   })

//   const handleInputChange = (field: string, value: string) => {
//     setEditFormData(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }

//   const handleSaveChanges = () => {
//     console.log('Saving changes:', editFormData)
//     setIsEditDialogOpen(false)
//   }

//   const handleCancel = () => {
//     setEditFormData({
//       fullName: mockUser.fullName,
//       email: mockUser.email,
//       phoneNumber: mockUser.phoneNumber,
//       address: mockUser.address,
//       role: mockUser.role,
//       status: mockUser.status
//     })
//     setIsEditDialogOpen(false)
//   }

//   const handlePasswordInput = (field: string, value: string) => {
//     setPasswordForm(prev => ({ ...prev, [field]: value }))
//   }

//   const handleSavePassword = () => {
//     console.log('Password change:', passwordForm)
//     // TODO: Gọi API đổi mật khẩu ở đây
//     setIsChangePassOpen(false)
//   }

//   const handleCancelPassword = () => {
//     setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
//     setIsChangePassOpen(false)
//   }

//   return (
//     <div className="min-h-screen bg-white text-black">
//       <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

//         {/* Header */}
//         <header className="mb-8">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <h1 className="text-2xl lg:text-3xl font-bold">Hồ sơ người dùng</h1>
//             <Button
//               onClick={() => setIsEditDialogOpen(true)}
//               className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-black px-4 py-2"
//             >
//               <Edit className="w-4 h-4" />
//               <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
//               <span className="sm:hidden">Sửa</span>
//             </Button>

//             <Button
//               onClick={() => setIsChangePassOpen(true)}
//               className="bg-gray-800 hover:bg-gray-900 text-white"
//             >
//               Đổi mật khẩu
//             </Button>

//             <Button
//               onClick={() => setIsChangePassOpen(true)}
//               className="bg-gray-800 hover:bg-gray-900 text-white"
//             >
//               Liên kết ORCID
//             </Button>
//           </div>
//         </header>

//         <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

//           {/* Left Column */}
//           <section className="xl:col-span-4">
//             <div className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">

//               <div className="p-6 pb-4">
//                 <div className="flex flex-col items-center text-center">
//                   <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mb-4">
//                     {mockUser.fullName.split(' ').map(n => n[0]).join('')}
//                   </div>
//                   <h2 className="text-xl font-semibold mb-2">{mockUser.fullName}</h2>
//                   <p className="text-gray-600 mb-3 break-all">{mockUser.email}</p>
//                   <div className="flex flex-wrap items-center justify-center gap-2">
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${mockUser.status === 'active'
//                       ? 'bg-green-100 text-green-800 border border-green-300'
//                       : 'bg-red-100 text-red-800 border border-red-300'
//                       }`}>
//                       {mockUser.status}
//                     </span>
//                     <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
//                       {mockUser.role}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Contact Info */}
//               <div className="px-6 pb-6">
//                 <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Thông tin liên hệ</h3>
//                 <div className="space-y-4">
//                   {[{ icon: Mail, label: 'Email', value: mockUser.email },
//                   { icon: Phone, label: 'Số điện thoại', value: mockUser.phoneNumber },
//                   { icon: MapPin, label: 'Địa chỉ', value: mockUser.address },
//                   { icon: Calendar, label: 'Ngày tham gia', value: mockUser.joinedDate },
//                   { icon: Users, label: 'Số hội nghị đã đăng ký', value: mockUser.registeredConferences }
//                   ].map((info, i) => (
//                     <div key={i} className="flex items-start gap-3">
//                       <div className="flex-shrink-0 mt-0.5">
//                         <info.icon className="w-4 h-4 text-gray-500" />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="text-xs text-gray-500 mb-1">{info.label}</p>
//                         <p className="text-sm">{info.value}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Right Column */}
//           <section className="xl:col-span-8">
//             <div className="bg-gray-50 border border-gray-300 rounded-lg">

//               <div className="p-6 pb-4 border-b border-gray-200">
//                 <h3 className="text-lg font-semibold">Hoạt động gần đây</h3>
//                 <p className="text-sm text-gray-500 mt-1">Nhật ký các hoạt động của người dùng</p>
//               </div>

//               <div className="p-6">
//                 <div className="space-y-4">
//                   {[
//                     { title: 'Responded 2 discussion in 1 Property', time: '24 August, 19:31', color: 'bg-blue-300' },
//                     { title: 'Seller list August 2024', time: '24 August, 19:31', color: 'bg-yellow-300' },
//                     { title: 'Status changed to Done', time: '24 August, 19:31', color: 'bg-purple-300' },
//                   ].map((item, i) => (
//                     <article key={i} className="bg-white rounded-lg p-4 border border-gray-200 hover:bg-gray-50 transition-colors">
//                       <div className="flex items-start gap-3">
//                         <div className={`flex-shrink-0 w-2 h-2 ${item.color} rounded-full mt-2`}></div>
//                         <div className="min-w-0 flex-1">
//                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-2">
//                             <p className="text-sm font-medium">{item.title}</p>
//                             <time className="text-xs text-gray-500 whitespace-nowrap">{item.time}</time>
//                           </div>
//                         </div>
//                       </div>
//                     </article>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </section>

//         </main>
//       </div>

//       {/* Edit Dialog */}
//       <Dialog open={isEditDialogOpen} as="div" className="relative z-50" onClose={setIsEditDialogOpen}>
//         <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <DialogPanel className="relative w-full max-w-md bg-white border border-gray-300 text-black overflow-hidden max-h-[90vh] overflow-y-auto rounded-lg shadow-xl">

//               <button onClick={() => setIsEditDialogOpen(false)}
//                 className="absolute top-3 right-3 z-10 text-gray-500 hover:text-black transition-colors rounded-full p-1"
//               >
//                 <X className="w-4 h-4" />
//               </button>

//               <header className="relative h-24 sm:h-32 bg-gray-100 overflow-hidden flex items-center justify-center text-xl font-bold">
//                 {editFormData.fullName.split(' ').map(n => n[0]).join('')}
//               </header>

//               <div className="relative px-4 sm:px-6 -mt-6 sm:-mt-8">

//                 {/* Personal Info */}
//                 <section className="mb-6">
//                   <fieldset>
//                     <legend className="text-sm font-medium text-gray-700 mb-3">Thông tin cá nhân</legend>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       <div>
//                         <Label htmlFor="firstName" className="text-sm text-gray-700">Họ</Label>
//                         <Input
//                           id="firstName"
//                           value={editFormData.fullName.split(' ')[0]}
//                           onChange={(e) => {
//                             const lastName = editFormData.fullName.split(' ').slice(1).join(' ')
//                             handleInputChange('fullName', `${e.target.value} ${lastName}`)
//                           }}
//                           className="bg-gray-100 border border-gray-300 text-black"
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="lastName" className="text-sm text-gray-700">Tên</Label>
//                         <Input
//                           id="lastName"
//                           value={editFormData.fullName.split(' ').slice(1).join(' ')}
//                           onChange={(e) => {
//                             const firstName = editFormData.fullName.split(' ')[0]
//                             handleInputChange('fullName', `${firstName} ${e.target.value}`)
//                           }}
//                           className="bg-gray-100 border border-gray-300 text-black"
//                         />
//                       </div>
//                     </div>
//                   </fieldset>
//                 </section>

//                 {/* Contact Info */}
//                 <section className="mb-6">
//                   <fieldset>
//                     <legend className="text-sm font-medium text-gray-700 mb-3">Thông tin liên hệ</legend>
//                     <div className="space-y-3">
//                       {[
//                         { id: 'email', label: 'Email', value: editFormData.email, icon: Mail },
//                         { id: 'phone', label: 'Số điện thoại', value: editFormData.phoneNumber, icon: Phone },
//                         { id: 'address', label: 'Địa chỉ', value: editFormData.address, icon: MapPin }
//                       ].map(info => (
//                         <div key={info.id}>
//                           <Label htmlFor={info.id} className="text-sm text-gray-700">{info.label}</Label>
//                           <div className="relative">
//                             <Input
//                               id={info.id}
//                               value={info.value}
//                               onChange={(e) => handleInputChange(info.id === 'email' ? 'email' : info.id === 'phone' ? 'phoneNumber' : 'address', e.target.value)}
//                               className="bg-gray-100 border border-gray-300 text-black pl-10"
//                             />
//                             <info.icon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </fieldset>
//                 </section>

//                 {/* Actions */}
//                 <footer className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
//                   <Button variant="outline" onClick={handleCancel} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100">Hủy</Button>
//                   <Button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700 text-white">Lưu thay đổi</Button>
//                 </footer>
//               </div>
//             </DialogPanel>
//           </div>
//         </div>
//       </Dialog>

//       <Dialog
//         open={isChangePassOpen}
//         as="div"
//         className="relative z-50"
//         onClose={setIsChangePassOpen}
//       >
//         <div className="fixed inset-0 bg-black/40" />
//         <div className="fixed inset-0 flex items-center justify-center p-4">
//           <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200">
//             <div className="p-6 space-y-5">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h2>
//                 <button
//                   onClick={() => setIsChangePassOpen(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="oldPassword" className="text-sm text-gray-700">
//                     Mật khẩu hiện tại
//                   </Label>
//                   <Input
//                     id="oldPassword"
//                     type="password"
//                     value={passwordForm.oldPassword}
//                     onChange={(e) => handlePasswordInput('oldPassword', e.target.value)}
//                     className="mt-1 bg-gray-50 border-gray-300 focus:border-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="newPassword" className="text-sm text-gray-700">
//                     Mật khẩu mới
//                   </Label>
//                   <Input
//                     id="newPassword"
//                     type="password"
//                     value={passwordForm.newPassword}
//                     onChange={(e) => handlePasswordInput('newPassword', e.target.value)}
//                     className="mt-1 bg-gray-50 border-gray-300 focus:border-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="confirmPassword" className="text-sm text-gray-700">
//                     Xác nhận mật khẩu mới
//                   </Label>
//                   <Input
//                     id="confirmPassword"
//                     type="password"
//                     value={passwordForm.confirmPassword}
//                     onChange={(e) => handlePasswordInput('confirmPassword', e.target.value)}
//                     className="mt-1 bg-gray-50 border-gray-300 focus:border-blue-500"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
//                 <Button
//                   variant="outline"
//                   onClick={handleCancelPassword}
//                   className="border-gray-300 text-gray-700 hover:bg-gray-100"
//                 >
//                   Hủy
//                 </Button>
//                 <Button
//                   onClick={handleSavePassword}
//                   className="bg-blue-600 hover:bg-blue-700 text-white"
//                 >
//                   Lưu
//                 </Button>
//               </div>
//             </div>
//           </DialogPanel>
//         </div>
//       </Dialog>

//     </div>
//   )
// }

// export default EditProfileScreen
