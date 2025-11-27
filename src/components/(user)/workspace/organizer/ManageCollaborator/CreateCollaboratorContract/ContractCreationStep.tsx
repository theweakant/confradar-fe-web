import React, { useEffect, } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollaboratorAccountResponse } from '@/types/user.type';
import { SkeletonTechConference } from '@/types/conference.type';
import { CreateCollaboratorContractRequest } from '@/types/contract.type';
import { Alert, AlertDescription } from '@/components/ui/alert';


interface ContractCreationStepProps {
    contractData: Partial<CreateCollaboratorContractRequest>;
    onDataChange: (data: Partial<CreateCollaboratorContractRequest>) => void;
    selectedUser: CollaboratorAccountResponse | null;
    selectedConference: SkeletonTechConference | null;
    users: CollaboratorAccountResponse[];
    conferences: SkeletonTechConference[];
    onUserSelectById: (userId: string) => void;
    onConferenceSelectById: (confId: string) => void;
}

const ContractCreationStep: React.FC<ContractCreationStepProps> = ({
    contractData,
    onDataChange,
    selectedUser,
    selectedConference,
    users,
    conferences,
    onUserSelectById,
    onConferenceSelectById,
}) => {
    useEffect(() => {
        if (contractData.isTicketSelling) {
            onDataChange({
                isPriceStep: true,
                isSessionStep: true,
            });
        }
    }, [contractData.isTicketSelling]);

    const handleCheckboxChange = (field: string, checked: boolean) => {
        if ((field === 'isPriceStep' || field === 'isSessionStep') &&
            contractData.isTicketSelling &&
            !checked) {
            return;
        }

        onDataChange({ [field]: checked });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="border-b pb-4">
                <h3 className="text-2xl font-bold text-gray-900">Tạo hợp đồng đối tác</h3>
                <p className="text-sm text-gray-600 mt-1">Điền đầy đủ thông tin để tạo hợp đồng cộng tác viên</p>
            </div>

            {/* Thông tin cơ bản */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">1</div>
                    Thông tin cơ bản
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="userId" className="text-sm font-medium">
                            Đối tác <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={selectedUser?.userId?.toString()}
                            onValueChange={(value) => {
                                onUserSelectById(value);
                                onDataChange({ userId: value });
                            }}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Chọn cộng tác viên" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.userId} value={user.userId.toString()}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.fullName}</span>
                                            <span className="text-xs text-gray-500">{user.email}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="conferenceId" className="text-sm font-medium">
                            Hội nghị <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            onValueChange={(value) => {
                                onConferenceSelectById(value);
                                onDataChange({ conferenceId: value });
                            }}
                        >
                            <SelectTrigger className="h-11">
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
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contractFile" className="text-sm font-medium">
                            Tệp hợp đồng <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="contractFile"
                            type="file"
                            className="h-11 cursor-pointer"
                            onChange={(e) => onDataChange({ contractFile: e.target.files?.[0]! })}
                        />
                        <p className="text-xs text-gray-500">Định dạng: PDF, DOC, DOCX (Tối đa 10MB)</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="commission" className="text-sm font-medium">
                            Hoa hồng (%) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="commission"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            className="h-11"
                            placeholder="Nhập % hoa hồng"
                            value={contractData.commission || ''}
                            onChange={(e) => onDataChange({ commission: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="signDay" className="text-sm font-medium">
                            Ngày ký <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="signDay"
                            type="date"
                            className="h-11"
                            value={contractData.signDay}
                            onChange={(e) => onDataChange({ signDay: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="finalizePaymentDate" className="text-sm font-medium">
                            Ngày thanh toán <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="finalizePaymentDate"
                            type="date"
                            className="h-11"
                            value={contractData.finalizePaymentDate}
                            onChange={(e) => onDataChange({ finalizePaymentDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Thông tin chia sẻ với Confradar */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">2</div>
                    Thông tin chia sẻ với Confradar
                </h4>
                <p className="text-sm text-gray-600 mb-4 ml-10">Chọn các thông tin sẽ được chia sẻ với nền tảng Confradar</p>

                <div className="ml-10 space-y-4">
                    {/* Ticket Selling Warning */}
                    {contractData.isTicketSelling && (
                        <Alert className="bg-amber-50 border-amber-200">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800 text-sm">
                                Hợp đồng này yêu cầu bán vé nên các bước thông tin sau: <strong>Price</strong> và <strong>Session</strong> không được để trống
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Info Alert */}
                    <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-sm">
                            <strong>Lưu ý:</strong> Các thông tin được chọn sẽ được chia sẻ công khai trên hệ thống Confradar
                        </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Media */}
                        <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${contractData.isMediaStep
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}>
                            <input
                                type="checkbox"
                                id="isMediaStep"
                                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={contractData.isMediaStep}
                                onChange={(e) => handleCheckboxChange('isMediaStep', e.target.checked)}
                            />
                            <label htmlFor="isMediaStep" className="flex-1 cursor-pointer">
                                <div className="font-medium text-gray-900">Media</div>
                                <div className="text-xs text-gray-600 mt-1">Hình ảnh, video, tài liệu</div>
                            </label>
                        </div>

                        {/* Policy */}
                        <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${contractData.isPolicyStep
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}>
                            <input
                                type="checkbox"
                                id="isPolicyStep"
                                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={contractData.isPolicyStep}
                                onChange={(e) => handleCheckboxChange('isPolicyStep', e.target.checked)}
                            />
                            <label htmlFor="isPolicyStep" className="flex-1 cursor-pointer">
                                <div className="font-medium text-gray-900">Policy</div>
                                <div className="text-xs text-gray-600 mt-1">Chính sách và điều khoản</div>
                            </label>
                        </div>

                        {/* Session */}
                        <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${contractData.isSessionStep
                            ? 'bg-blue-50 border-blue-300'
                            : contractData.isTicketSelling
                                ? 'bg-amber-50 border-amber-300'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}>
                            <input
                                type="checkbox"
                                id="isSessionStep"
                                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={contractData.isSessionStep}
                                disabled={contractData.isTicketSelling}
                                onChange={(e) => handleCheckboxChange('isSessionStep', e.target.checked)}
                            />
                            <label htmlFor="isSessionStep" className="flex-1 cursor-pointer">
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                    Session
                                    {contractData.isTicketSelling && <span className="text-xs text-amber-600">(Bắt buộc)</span>}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">Lịch trình và phiên họp</div>
                            </label>
                        </div>

                        {/* Price */}
                        <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${contractData.isPriceStep
                            ? 'bg-blue-50 border-blue-300'
                            : contractData.isTicketSelling
                                ? 'bg-amber-50 border-amber-300'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}>
                            <input
                                type="checkbox"
                                id="isPriceStep"
                                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={contractData.isPriceStep}
                                disabled={contractData.isTicketSelling}
                                onChange={(e) => handleCheckboxChange('isPriceStep', e.target.checked)}
                            />
                            <label htmlFor="isPriceStep" className="flex-1 cursor-pointer">
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                    Price
                                    {contractData.isTicketSelling && <span className="text-xs text-amber-600">(Bắt buộc)</span>}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">Thông tin giá vé</div>
                            </label>
                        </div>

                        {/* Ticket Selling */}
                        <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${contractData.isTicketSelling
                            ? 'bg-green-50 border-green-300'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}>
                            <input
                                type="checkbox"
                                id="isTicketSelling"
                                className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                checked={contractData.isTicketSelling}
                                onChange={(e) => handleCheckboxChange('isTicketSelling', e.target.checked)}
                            />
                            <label htmlFor="isTicketSelling" className="flex-1 cursor-pointer">
                                <div className="font-medium text-gray-900">Ticket Selling</div>
                                <div className="text-xs text-gray-600 mt-1">Bán vé qua hệ thống</div>
                            </label>
                        </div>

                        {/* Sponsor */}
                        <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${contractData.isSponsorStep
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}>
                            <input
                                type="checkbox"
                                id="isSponsorStep"
                                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={contractData.isSponsorStep}
                                onChange={(e) => handleCheckboxChange('isSponsorStep', e.target.checked)}
                            />
                            <label htmlFor="isSponsorStep" className="flex-1 cursor-pointer">
                                <div className="font-medium text-gray-900">Sponsor</div>
                                <div className="text-xs text-gray-600 mt-1">Thông tin nhà tài trợ</div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractCreationStep;