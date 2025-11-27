'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon, UserPlusIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetCollaboratorAccountsQuery } from '@/redux/services/user.service';
import { useLazyGetSkeletonTechConferencesForCollaboratorQuery } from '@/redux/services/conference.service';
import { useCreateSkeletonNameForConferenceInContractMutation } from '@/redux/services/conferenceStep.service';
import { useCreateCollaboratorContractMutation } from '@/redux/services/contract.service';
import { CollaboratorAccountResponse } from '@/types/user.type';
import { toast } from 'sonner';
import { SkeletonTechConference } from '@/types/conference.type';
import { CreateCollaboratorContractRequest } from '@/types/contract.type';

// Types for component state
interface StepData {
  selectedUser: CollaboratorAccountResponse | null;
  selectedConference: SkeletonTechConference | null;
  contractData: Partial<CreateCollaboratorContractRequest>;
}

interface CreateCollaboratorContractProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Step 1: User Selection Component
interface UserSelectionStepProps {
  selectedUser: CollaboratorAccountResponse | null;
  onUserSelect: (user: CollaboratorAccountResponse) => void;
  onCreateUser: () => void;
  users: CollaboratorAccountResponse[];
  isLoading: boolean;
  refetchUsers: () => void;
}

const UserSelectionStep: React.FC<UserSelectionStepProps> = ({
  selectedUser,
  onUserSelect,
  onCreateUser,
  users,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Chọn tài khoản cộng tác viên</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateUser}
          className="flex items-center gap-2"
        >
          <UserPlusIcon className="h-4 w-4" />
          Thêm tài khoản
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <Card
              key={user.userId}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedUser?.userId === user.userId ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
              onClick={() => onUserSelect(user)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">{user.organizationName}</p>
                  </div>
                  {selectedUser?.userId === user.userId && (
                    <Badge variant="default">Đã chọn</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && users.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Chưa có tài khoản cộng tác viên nào</p>
          <Button variant="outline" className="mt-2" onClick={onCreateUser}>
            Tạo tài khoản đầu tiên
          </Button>
        </div>
      )}
    </div>
  );
};

// Step 2: Conference Selection Component
interface ConferenceSelectionStepProps {
  selectedConference: SkeletonTechConference | null;
  onConferenceSelect: (conference: SkeletonTechConference) => void;
  onCreateConference: () => void;
  conferences: SkeletonTechConference[];
  isLoading: boolean;
  selectedUserId: string;
}

const ConferenceSelectionStep: React.FC<ConferenceSelectionStepProps> = ({
  selectedConference,
  onConferenceSelect,
  onCreateConference,
  conferences,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Chọn hội nghị</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateConference}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Tạo hội nghị mới
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
          {conferences.map((conference) => (
            <Card
              key={conference.conferenceId}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedConference?.conferenceId === conference.conferenceId ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
              onClick={() => onConferenceSelect(conference)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{conference.name}</p>
                    {/* <p className="text-sm text-gray-600">{conference.description}</p> */}
                    {/* <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Ngày bắt đầu: {new Date(conference.).toLocaleDateString('vi-VN')}</span>
                      <span>Ngày kết thúc: {new Date(conference.endDate).toLocaleDateString('vi-VN')}</span>
                    </div> */}
                  </div>
                  {selectedConference?.conferenceId === conference.conferenceId && (
                    <Badge variant="default">Đã chọn</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && conferences.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Chưa có hội nghị nào</p>
          <Button variant="outline" className="mt-2" onClick={onCreateConference}>
            Tạo hội nghị đầu tiên
          </Button>
        </div>
      )}
    </div>
  );
};

// Step 3: Contract Creation Component
interface ContractCreationStepProps {
  contractData: Partial<CreateCollaboratorContractRequest>;
  onDataChange: (data: Partial<CreateCollaboratorContractRequest>) => void;
  selectedUser: CollaboratorAccountResponse | null;
  selectedConference: SkeletonTechConference | null;
  users: CollaboratorAccountResponse[];
  conferences: SkeletonTechConference[];
}

const ContractCreationStep: React.FC<ContractCreationStepProps> = ({
  contractData,
  onDataChange,
  selectedUser,
  selectedConference,
  users,
  conferences,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Tạo hợp đồng cộng tác</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="userId">Cộng tác viên</Label>
            <Select
              value={selectedUser?.userId?.toString()}
              onValueChange={(value) => onDataChange({ userId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn cộng tác viên" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.userId} value={user.userId.toString()}>
                    {user.fullName} - {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="conferenceId">Hội nghị</Label>
            <Select
              value={selectedConference?.conferenceId?.toString()}
              onValueChange={(value) => onDataChange({ conferenceId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn hội nghị" />
              </SelectTrigger>
              <SelectContent>
                {conferences.map((conference) => (
                  conference.conferenceId && (
                    <SelectItem
                      key={conference.conferenceId}
                      value={conference.conferenceId.toString()}
                    >
                      {conference.name}
                    </SelectItem>
                  )
                  // <SelectItem key={conference.conferenceId} value={conference.conferenceId?.toString()}>
                  //   {conference.name}
                  // </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File hợp đồng */}
          <div>
            <Label htmlFor="contractFile">Tệp hợp đồng</Label>
            <Input
              id="contractFile"
              type="file"
              onChange={(e) => onDataChange({ contractFile: e.target.files?.[0]! })}
            />
          </div>

          {/* Ngày ký hợp đồng */}
          <div>
            <Label htmlFor="signDay">Ngày ký</Label>
            <Input
              id="signDay"
              type="date"
              value={contractData.signDay}
              onChange={(e) => onDataChange({ signDay: e.target.value })}
            />
          </div>

          {/* Ngày thanh toán */}
          <div>
            <Label htmlFor="finalizePaymentDate">Ngày thanh toán</Label>
            <Input
              id="finalizePaymentDate"
              type="date"
              value={contractData.finalizePaymentDate}
              onChange={(e) => onDataChange({ finalizePaymentDate: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Các bước hợp đồng */}
          <div className="flex flex-col gap-2">
            <Label>Bước hợp đồng</Label>
            <div className="flex flex-col gap-1">
              <label>
                <input
                  type="checkbox"
                  checked={contractData.isMediaStep}
                  onChange={(e) => onDataChange({ isMediaStep: e.target.checked })}
                />
                Media
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={contractData.isPolicyStep}
                  onChange={(e) => onDataChange({ isPolicyStep: e.target.checked })}
                />
                Policy
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={contractData.isSessionStep}
                  onChange={(e) => onDataChange({ isSessionStep: e.target.checked })}
                />
                Session
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={contractData.isPriceStep}
                  onChange={(e) => onDataChange({ isPriceStep: e.target.checked })}
                />
                Price
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={contractData.isTicketSelling}
                  onChange={(e) => onDataChange({ isTicketSelling: e.target.checked })}
                />
                Ticket Selling
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={contractData.isSponsorStep}
                  onChange={(e) => onDataChange({ isSponsorStep: e.target.checked })}
                />
                Sponsor
              </label>
            </div>
          </div>

          {/* Commission */}
          <div>
            <Label htmlFor="commission">Hoa hồng (%)</Label>
            <Input
              id="commission"
              type="number"
              value={contractData.commission || 0}
              onChange={(e) => onDataChange({ commission: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// User Creation Dialog Component
interface UserCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UserCreationDialog: React.FC<UserCreationDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Tạo tài khoản cộng tác viên
                </Dialog.Title>

                <div className="text-center py-8">
                  <p className="text-gray-500">Dialog tạo tài khoản đã có sẵn - cần tích hợp vào đây</p>
                  <div className="mt-4 space-x-2">
                    <Button onClick={onSuccess} variant="default">
                      Tạo thành công (Mock)
                    </Button>
                    <Button onClick={onClose} variant="outline">
                      Hủy
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Conference Creation Dialog Component
interface ConferenceCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  collaboratorId?: string;
}

const ConferenceCreationDialog: React.FC<ConferenceCreationDialogProps> = ({ isOpen, onClose, onSuccess, collaboratorId }) => {
  const [conferenceName, setConferenceName] = useState('');
  const [createSkeleton, { isLoading }] = useCreateSkeletonNameForConferenceInContractMutation();

  const handleSubmit = async () => {
    if (!conferenceName.trim() || !collaboratorId) {
      toast.error('Vui lòng nhập tên hội nghị và chọn tài khoản cộng tác viên');
      return;
    }

    try {
      await createSkeleton({
        name: conferenceName.trim(),
        collabId: collaboratorId
      }).unwrap();
      toast.success('Tạo hội nghị thành công');
      setConferenceName('');
      onSuccess();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo hội nghị');
      console.error('Error creating conference:', error);
    }
  };

  // const handleSubmit = async () => {
  //   if (!conferenceName.trim()) {
  //     toast.error('Vui lòng nhập tên hội nghị');
  //     return;
  //   }

  //   try {
  //     await createSkeleton({ name: conferenceName.trim() }).unwrap();
  //     toast.success('Tạo hội nghị thành công');
  //     setConferenceName('');
  //     onSuccess();
  //   } catch (error) {
  //     toast.error('Có lỗi xảy ra khi tạo hội nghị');
  //     console.error('Error creating conference:', error);
  //   }
  // };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Tạo hội nghị mới
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="conferenceName">Tên hội nghị</Label>
                    <Input
                      id="conferenceName"
                      value={conferenceName}
                      onChange={(e) => setConferenceName(e.target.value)}
                      placeholder="Nhập tên hội nghị"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="mt-6 flex space-x-3 justify-end">
                  <Button onClick={onClose} variant="outline" disabled={isLoading}>
                    Hủy
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading || !conferenceName.trim()}>
                    {isLoading ? 'Đang tạo...' : 'Tạo hội nghị'}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Main Component
const CreateCollaboratorContract: React.FC<CreateCollaboratorContractProps> = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<StepData>({
    selectedUser: null,
    selectedConference: null,
    contractData: {}
  });
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showConferenceDialog, setShowConferenceDialog] = useState(false);

  // API hooks
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useGetCollaboratorAccountsQuery();
  const [getConferences, { data: conferences, isLoading: conferencesLoading }] = useLazyGetSkeletonTechConferencesForCollaboratorQuery();
  const [createContract, { isLoading: contractLoading }] = useCreateCollaboratorContractMutation();

  // Load conferences when user is selected
  useEffect(() => {
    if (stepData.selectedUser?.userId) {
      getConferences({ collaboratorId: stepData.selectedUser.userId });
    }
  }, [stepData.selectedUser?.userId, getConferences]);

  // Sync contract data with selected user/conference
  useEffect(() => {
    setStepData(prev => ({
      ...prev,
      contractData: {
        ...prev.contractData,
        userId: prev.selectedUser?.userId,
        conferenceId: prev.selectedConference?.conferenceId ?? undefined
      }
    }));
  }, [stepData.selectedUser, stepData.selectedConference]);

  const handleUserSelect = (user: CollaboratorAccountResponse) => {
    setStepData(prev => ({
      ...prev,
      selectedUser: user,
      selectedConference: null,
      contractData: {
        ...prev.contractData,
        userId: user.userId,
        conferenceId: undefined
      }
    }));
  };

  const handleConferenceSelect = (conference: SkeletonTechConference) => {
    setStepData(prev => ({
      ...prev,
      selectedConference: conference,
      contractData: {
        ...prev.contractData,
        conferenceId: conference.conferenceId ?? undefined
      }
    }));
  };

  const handleContractDataChange = (data: Partial<CreateCollaboratorContractRequest>) => {
    setStepData(prev => ({
      ...prev,
      contractData: { ...prev.contractData, ...data }
    }));
  };

  const handleUserCreated = () => {
    setShowUserDialog(false);
    refetchUsers();
    toast.success('Tạo tài khoản thành công');
  };

  const handleConferenceCreated = () => {
    setShowConferenceDialog(false);
    if (stepData.selectedUser?.userId) {
      getConferences({ collaboratorId: stepData.selectedUser.userId });
    }
    toast.success('Tạo hội nghị thành công');
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !stepData.selectedUser) {
      toast.error('Vui lòng chọn một tài khoản');
      return;
    }
    if (currentStep === 2 && !stepData.selectedConference) {
      toast.error('Vui lòng chọn một hội nghị');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    const { contractData } = stepData;

    if (
      !contractData.userId ||
      !contractData.conferenceId ||
      !contractData.signDay ||
      !contractData.commission ||
      !contractData.finalizePaymentDate ||
      !contractData.contractFile ||
      contractData.isMediaStep === undefined ||
      contractData.isPolicyStep === undefined ||
      contractData.isSessionStep === undefined ||
      contractData.isPriceStep === undefined ||
      contractData.isTicketSelling === undefined ||
      contractData.isSponsorStep === undefined
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    try {
      await createContract(contractData as CreateCollaboratorContractRequest).unwrap();
      toast.success('Tạo hợp đồng thành công');
      onSuccess?.();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo hợp đồng');
      console.error('Error creating contract:', error);
    }
  };

  const steps = [
    { number: 1, title: 'Chọn tài khoản', description: 'Chọn cộng tác viên' },
    { number: 2, title: 'Chọn hội nghị', description: 'Chọn hội nghị tham gia' },
    { number: 3, title: 'Tạo hợp đồng', description: 'Điền thông tin hợp đồng' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.number
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {step.number}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-20 h-px mx-4 mt-5
                  ${currentStep > step.number ? 'bg-primary' : 'bg-gray-200'}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <CardTitle>Tạo hợp đồng cộng tác - Bước {currentStep}/3</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <UserSelectionStep
              selectedUser={stepData.selectedUser}
              onUserSelect={handleUserSelect}
              onCreateUser={() => setShowUserDialog(true)}
              users={users?.data ?? []}
              isLoading={usersLoading}
              refetchUsers={refetchUsers}
            />
          )}

          {currentStep === 2 && (
            <ConferenceSelectionStep
              selectedConference={stepData.selectedConference}
              onConferenceSelect={handleConferenceSelect}
              onCreateConference={() => setShowConferenceDialog(true)}
              conferences={conferences?.data ?? []}
              isLoading={conferencesLoading}
              selectedUserId={stepData.selectedUser?.userId ?? ""}
            />
          )}

          {currentStep === 3 && (
            <ContractCreationStep
              contractData={stepData.contractData}
              onDataChange={handleContractDataChange}
              selectedUser={stepData.selectedUser}
              selectedConference={stepData.selectedConference}
              users={users?.data ?? []}
              conferences={conferences?.data ?? []}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePreviousStep} className="flex items-center gap-2">
              <ChevronLeftIcon className="h-4 w-4" />
              Quay lại
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNextStep} className="flex items-center gap-2">
              Tiếp tục
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={contractLoading}>
              {contractLoading ? 'Đang tạo...' : 'Tạo hợp đồng'}
            </Button>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <UserCreationDialog
        isOpen={showUserDialog}
        onClose={() => setShowUserDialog(false)}
        onSuccess={handleUserCreated}
      />

      <ConferenceCreationDialog
        isOpen={showConferenceDialog}
        onClose={() => setShowConferenceDialog(false)}
        onSuccess={handleConferenceCreated}
        collaboratorId={stepData.selectedUser?.userId}
      />
    </div>
  );
};

export default CreateCollaboratorContract;