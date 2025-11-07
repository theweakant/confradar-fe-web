import React from 'react';
import { ResearchConferenceDetailResponse, TechnicalConferenceDetailResponse } from '@/types/conference.type';
import { Shield, DollarSign, FileText } from 'lucide-react';

interface PolicyTabProps {
    conference: TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
}

const PolicyTab: React.FC<PolicyTabProps> = ({ conference }) => {
    const policies = conference.policies || [];
    // Both technical and research conferences can have refund policies
    const refundPolicies = conference.refundPolicies || [];

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Chính sách & Hoàn tiền</h2>

            {/* Policies Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">Chính sách & Quy định</h3>
                </div>
                {policies.length > 0 ? (
                    <div className="space-y-4">
                        {policies.map((policy) => (
                            <div key={policy.policyId} className="bg-white/20 backdrop-blur-md rounded-lg p-6 border border-white/10">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-2 text-lg">
                                            {policy.policyName || 'Chính sách chưa đặt tên'}
                                        </h4>
                                        <p className="text-white/80 leading-relaxed">
                                            {policy.description || 'Chưa có mô tả cho chính sách này'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-white/70 py-8 bg-white/10 rounded-lg border border-white/10">
                        <FileText className="w-12 h-12 text-white/30 mx-auto mb-3" />
                        <p className="text-lg">Chưa có thông tin về chính sách và quy định</p>
                        <p className="text-sm text-white/50 mt-1">Thông tin chính sách sẽ được cập nhật sớm</p>
                    </div>
                )}
            </div>

            {/* Refund Policies Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-semibold text-white">Chính sách hoàn tiền</h3>
                </div>
                {refundPolicies.length > 0 ? (
                    <div className="space-y-4">
                        {refundPolicies
                            .sort((a, b) => {
                                // Sort by refundOrder first, then by percentRefund descending
                                const orderA = a.refundOrder || 999;
                                const orderB = b.refundOrder || 999;
                                if (orderA !== orderB) return orderA - orderB;
                                
                                const percentA = a.percentRefund || 0;
                                const percentB = b.percentRefund || 0;
                                return percentB - percentA; // Higher percentage first
                            })
                            .map((refund) => (
                            <div key={refund.refundPolicyId} className="bg-white/20 backdrop-blur-md rounded-lg p-6 border border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                            <span className="text-green-400 font-bold text-xl">
                                                {refund.percentRefund || 0}%
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white text-lg mb-1">
                                                Hoàn {refund.percentRefund || 0}% phí tham gia
                                            </h4>
                                            <p className="text-white/80">
                                                <span className="text-white/60">Hạn chót hoàn tiền: </span>
                                                {refund.refundDeadline 
                                                    ? new Date(refund.refundDeadline).toLocaleDateString('vi-VN', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : 'Chưa xác định'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                                            Thứ tự: {refund.refundOrder || 'Chưa xác định'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-white/70 py-8 bg-white/10 rounded-lg border border-white/10">
                        <DollarSign className="w-12 h-12 text-white/30 mx-auto mb-3" />
                        <p className="text-lg">Chưa có thông tin về chính sách hoàn tiền</p>
                        <p className="text-sm text-white/50 mt-1">Vui lòng liên hệ ban tổ chức để biết thêm chi tiết</p>
                    </div>
                )}
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-yellow-400 mb-1">Lưu ý quan trọng</h4>
                        <p className="text-white/80 text-sm">
                            Vui lòng đọc kỹ các chính sách trước khi đăng ký tham gia hội nghị. 
                            Mọi thắc mắc về chính sách và điều khoản hoàn tiền, xin liên hệ ban tổ chức để được hỗ trợ.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyTab;