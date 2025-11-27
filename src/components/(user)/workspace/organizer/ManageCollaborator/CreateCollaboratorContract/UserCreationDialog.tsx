
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

interface UserCreationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UserCreationDialog: React.FC<UserCreationDialogProps> = ({ isOpen, onClose, onSuccess }) => {
    const [createCollaborator, { isLoading: isCreating, error: createRawError }] = useCreateCollaboratorMutation();

    useEffect(() => {
        if (createRawError) toast.error(parseApiError<string>(createRawError)?.data?.message)
    }, [createRawError]);

    const handleSave = async (data: CollaboratorRequest) => {
        try {
            const response = await createCollaborator(data).unwrap();
            toast.success(response.message || "Thêm tài khoản đối tác thành công!");
            onSuccess();
            onClose();
        } catch (error: unknown) {
            // Error already handled by useEffect with createError
        }
    };

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
                                    Tạo tài khoản đối tác
                                </Dialog.Title>

                                <div className="py-2">
                                    <CollaboratorForm
                                        collaborator={null}
                                        onSave={handleSave}
                                        onCancel={onClose}
                                    />
                                </div>

                                {/* <div className="text-center py-8">
                  <p className="text-gray-500">Dialog tạo tài khoản đã có sẵn - cần tích hợp vào đây</p>
                  <div className="mt-4 space-x-2">
                    <Button onClick={onSuccess} variant="default">
                      Tạo thành công (Mock)
                    </Button>
                    <Button onClick={onClose} variant="outline">
                      Hủy
                    </Button>
                  </div>
                </div> */}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default UserCreationDialog;