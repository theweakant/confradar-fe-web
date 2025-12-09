'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon, UserPlusIcon, PlusIcon, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateCollaboratorMutation, useGetCollaboratorAccountsQuery } from '@/redux/services/user.service';
import { useLazyGetSkeletonTechConferencesForCollaboratorQuery } from '@/redux/services/conference.service';
import { useCreateSkeletonNameForConferenceInContractMutation } from '@/redux/services/conferenceStep.service';
import { useCreateCollaboratorContractMutation } from '@/redux/services/contract.service';
import { CollaboratorAccountResponse, CollaboratorRequest } from '@/types/user.type';
import { toast } from 'sonner';
import { SkeletonTechConference } from '@/types/conference.type';
import { CreateCollaboratorContractRequest } from '@/types/contract.type';
import { CollaboratorForm } from '../CollaboratorForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import UserSelectionStep from './UserSelectionStep';
import ConferenceSelectionStep from './ConferenceSelectionStep';
import ContractCreationStep from './ContractCreationStep';
import { parseApiError } from '@/helper/api';
import UserCreationDialog from './UserCreationDialog';
import ConferenceCreationDialog from './ConferenceCreationDialog';

interface StepData {
  selectedUser: CollaboratorAccountResponse | null;
  selectedConference: SkeletonTechConference | null;
  contractData: Partial<CreateCollaboratorContractRequest>;
}

interface CreateCollaboratorContractProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}


// const ContractCreationStep: React.FC<ContractCreationStepProps> = ({
//   contractData,
//   onDataChange,
//   selectedUser,
//   selectedConference,
//   users,
//   conferences,
// }) => {
//   return (
//     <div className="space-y-6">
//       <h3 className="text-lg font-semibold">Tạo hợp đồng đối tác</h3>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="space-y-4">
//           <div>
//             <Label htmlFor="userId">Đối tác</Label>
//             <Select
//               value={selectedUser?.userId?.toString()}
//               onValueChange={(value) => onDataChange({ userId: value })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Chọn đối tác" />
//               </SelectTrigger>
//               <SelectContent>
//                 {users.map((user) => (
//                   <SelectItem key={user.userId} value={user.userId.toString()}>
//                     {user.fullName} - {user.email}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div>
//             <Label htmlFor="conferenceId">Hội nghị</Label>
//             <Select
//               value={selectedConference?.conferenceId?.toString()}
//               onValueChange={(value) => onDataChange({ conferenceId: value })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Chọn hội nghị" />
//               </SelectTrigger>
//               <SelectContent>
//                 {conferences.map((conference) => (
//                   conference.conferenceId && (
//                     <SelectItem
//                       key={conference.conferenceId}
//                       value={conference.conferenceId.toString()}
//                     >
//                       {conference.name}
//                     </SelectItem>
//                   )
//                   // <SelectItem key={conference.conferenceId} value={conference.conferenceId?.toString()}>
//                   //   {conference.name}
//                   // </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* File hợp đồng */}
//           <div>
//             <Label htmlFor="contractFile">Tệp hợp đồng</Label>
//             <Input
//               id="contractFile"
//               type="file"
//               onChange={(e) => onDataChange({ contractFile: e.target.files?.[0]! })}
//             />
//           </div>

//           {/* Ngày ký hợp đồng */}
//           <div>
//             <Label htmlFor="signDay">Ngày ký</Label>
//             <Input
//               id="signDay"
//               type="date"
//               value={contractData.signDay}
//               onChange={(e) => onDataChange({ signDay: e.target.value })}
//             />
//           </div>

//           {/* Ngày thanh toán */}
//           <div>
//             <Label htmlFor="finalizePaymentDate">Ngày thanh toán</Label>
//             <Input
//               id="finalizePaymentDate"
//               type="date"
//               value={contractData.finalizePaymentDate}
//               onChange={(e) => onDataChange({ finalizePaymentDate: e.target.value })}
//             />
//           </div>
//         </div>

//         <div className="space-y-4">
//           {/* Các bước hợp đồng */}
//           <div className="flex flex-col gap-2">
//             <Label>Bước hợp đồng</Label>
//             <div className="flex flex-col gap-1">
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={contractData.isMediaStep}
//                   onChange={(e) => onDataChange({ isMediaStep: e.target.checked })}
//                 />
//                 Media
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={contractData.isPolicyStep}
//                   onChange={(e) => onDataChange({ isPolicyStep: e.target.checked })}
//                 />
//                 Policy
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={contractData.isSessionStep}
//                   onChange={(e) => onDataChange({ isSessionStep: e.target.checked })}
//                 />
//                 Session
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={contractData.isPriceStep}
//                   onChange={(e) => onDataChange({ isPriceStep: e.target.checked })}
//                 />
//                 Price
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={contractData.isTicketSelling}
//                   onChange={(e) => onDataChange({ isTicketSelling: e.target.checked })}
//                 />
//                 Ticket Selling
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={contractData.isSponsorStep}
//                   onChange={(e) => onDataChange({ isSponsorStep: e.target.checked })}
//                 />
//                 Sponsor
//               </label>
//             </div>
//           </div>

//           {/* Commission */}
//           <div>
//             <Label htmlFor="commission">Hoa hồng (%)</Label>
//             <Input
//               id="commission"
//               type="number"
//               value={contractData.commission || 0}
//               onChange={(e) => onDataChange({ commission: parseFloat(e.target.value) })}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// User Creation Dialog Component


const CreateCollaboratorContract: React.FC<CreateCollaboratorContractProps> = ({ onSuccess, onCancel }) => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<StepData>({
    selectedUser: null,
    selectedConference: null,
    contractData: {
      isMediaStep: false,
      isPolicyStep: false,
      isSessionStep: false,
      isPriceStep: false,
      isTicketSelling: false,
      isSponsorStep: false,
      commission: undefined,
      // signDay: '',
      // finalizePaymentDate: ''
    }
  });
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showConferenceDialog, setShowConferenceDialog] = useState(false);

  // API hooks
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useGetCollaboratorAccountsQuery();
  const [getConferences, { data: conferences, isLoading: conferencesLoading }] = useLazyGetSkeletonTechConferencesForCollaboratorQuery();
  const [createContract, { isLoading: contractLoading, error: createContractError }] = useCreateCollaboratorContractMutation();

  useEffect(() => {
    if (stepData.selectedUser?.userId) {
      getConferences({ collaboratorId: stepData.selectedUser.userId });
    }
  }, [stepData.selectedUser?.userId, getConferences]);

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

  useEffect(() => {
    if (createContractError) toast.error(parseApiError<string>(createContractError)?.data?.message)
  }, [createContractError]);

  const handleCancel = () => {
    router.back();
  };

  const handleUserSelect = (user: CollaboratorAccountResponse | null) => {
    setStepData(prev => ({
      ...prev,
      selectedUser: user,
      selectedConference: null,
      contractData: {
        ...prev.contractData,
        userId: user?.userId,
        conferenceId: undefined
      }
    }));
  };

  const handleConferenceSelect = (conference: SkeletonTechConference | null) => {
    setStepData(prev => ({
      ...prev,
      selectedConference: conference,
      contractData: {
        ...prev.contractData,
        conferenceId: conference?.conferenceId ?? undefined
      }
    }));
  };

  const handleUserSelectById = (userId: string) => {
    const user = users?.data.find(u => u.userId.toString() === userId) ?? null;
    handleUserSelect(user);
  };

  const handleConferenceSelectById = (confId: string) => {
    const conf = conferences?.data.find(c => c.conferenceId?.toString() === confId) ?? null;
    handleConferenceSelect(conf);
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

    // Các field bắt buộc chung
    const requiredFields: (keyof CreateCollaboratorContractRequest)[] = [
      'userId',
      'conferenceId',
      'signDay',
      'contractFile',
      // 'isMediaStep',
      // 'isPolicyStep',
      // 'isSponsorStep'
    ];

    for (const field of requiredFields) {
      if (contractData[field] === undefined || contractData[field] === null) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }
    }

    // Logic riêng cho isTicketSelling
    if (contractData.isTicketSelling) {
      if (
        !contractData.finalizePaymentDate ||
        !contractData.commission ||
        contractData.isPriceStep !== true ||
        contractData.isSessionStep !== true
      ) {
        toast.error(
          'Vui lòng điền đầy đủ thông tin thanh toán, giá vé và session khi bán vé'
        );
        return;
      }
    } else {
      // Khi isTicketSelling = false, finalizePaymentDate, commission không bắt buộc
      // isPriceStep, isSessionStep chỉ cần có value, true/false đều ok
      if (
        contractData.isPriceStep === undefined ||
        contractData.isSessionStep === undefined
      ) {
        toast.error('Vui lòng xác định bước Price và Session');
        return;
      }
    }
    // const { contractData } = stepData;

    // if (
    //   !contractData.userId ||
    //   !contractData.conferenceId ||
    //   !contractData.signDay ||
    //   !contractData.commission ||
    //   !contractData.finalizePaymentDate ||
    //   !contractData.contractFile ||
    //   contractData.isMediaStep === undefined ||
    //   contractData.isPolicyStep === undefined ||
    //   contractData.isSessionStep === undefined ||
    //   contractData.isPriceStep === undefined ||
    //   contractData.isTicketSelling === undefined ||
    //   contractData.isSponsorStep === undefined
    // ) {
    //   toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
    //   return;
    // }
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
    { number: 1, title: 'Chọn tài khoản', description: 'Chọn tài khoản đối tác' },
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
          <div className="flex flex-wrap gap-2 mb-4">
            {stepData.selectedUser && (
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <span>{stepData.selectedUser.fullName}</span>
                <button
                  onClick={() => handleUserSelect(null)}
                  className="ml-2 text-blue-600 font-bold hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            )}

            {stepData.selectedConference && (
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                <span>{stepData.selectedConference.name}</span>
                <button
                  onClick={() => handleConferenceSelect(null)}
                  className="ml-2 text-green-600 font-bold hover:text-green-800"
                >
                  ×
                </button>
              </div>
            )}
          </div>

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
              selectedUser={stepData.selectedUser}
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
              onUserSelectById={handleUserSelectById}
              onConferenceSelectById={handleConferenceSelectById}
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
          <Button variant="outline" onClick={handleCancel}>
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