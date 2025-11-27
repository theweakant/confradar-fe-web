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

interface ConferenceCreationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    collaboratorId?: string;
}

const ConferenceCreationDialog: React.FC<ConferenceCreationDialogProps> = ({ isOpen, onClose, onSuccess, collaboratorId }) => {
    const [conferenceName, setConferenceName] = useState('');
    const [createSkeleton, { isLoading, error }] = useCreateSkeletonNameForConferenceInContractMutation();

    useEffect(() => {
        if (error) toast.error(parseApiError<string>(error)?.data?.message)
    }, [error]);

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

export default ConferenceCreationDialog;