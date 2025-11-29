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
                <h3 className="text-lg font-semibold">Chọn tài khoản đối tác</h3>
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
                            onClick={() => onUserSelect(user)}
                            className={`
    cursor-pointer transition-all hover:shadow-md rounded-lg
    ${selectedUser?.userId === user.userId
                                    ? 'border-primary border-2 bg-primary/5'
                                    : 'border border-gray-200 hover:border-gray-300'}
  `}
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
            )
            }

            {
                !isLoading && users.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Chưa có tài khoản đối tác nào</p>
                        <Button variant="outline" className="mt-2" onClick={onCreateUser}>
                            Tạo tài khoản đầu tiên
                        </Button>
                    </div>
                )
            }
        </div >
    );
};

export default UserSelectionStep;