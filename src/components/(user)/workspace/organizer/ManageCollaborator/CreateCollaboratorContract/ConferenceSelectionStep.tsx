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

interface ConferenceSelectionStepProps {
    selectedConference: SkeletonTechConference | null;
    selectedUser: CollaboratorAccountResponse | null;
    onConferenceSelect: (conference: SkeletonTechConference) => void;
    onCreateConference: () => void;
    conferences: SkeletonTechConference[];
    isLoading: boolean;
    selectedUserId: string;
}

const ConferenceSelectionStep: React.FC<ConferenceSelectionStepProps> = ({
    selectedConference,
    selectedUser,
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
                            onClick={() => onConferenceSelect(conference)}
                            className={`
    cursor-pointer transition-all hover:shadow-md rounded-lg
    ${selectedConference?.conferenceId === conference.conferenceId
                                    ? 'border-primary border-2 bg-primary/5'
                                    : 'border border-gray-200 hover:border-gray-300'}
  `}
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
                    <p className="text-gray-500">Người dùng {selectedUser?.fullName} chưa có hội nghị nào</p>
                    <Button variant="outline" className="mt-2" onClick={onCreateConference}>
                        Tạo hội nghị đầu tiên
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ConferenceSelectionStep;