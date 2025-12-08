// components/pages/ConferenceDetailPage/Tab/ResearchTimelineTab.tsx
"use client";
import {
  Info,
  Clock,
  UserCheck,
  FileText,
  MessageCircle,
  Edit3,
  PackageCheck,
  Workflow
} from "lucide-react";
import { useActivateWaitlistMutation, useGetResearchConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConferencePriceResponse, Phase, RefundInPhase, ResearchConferencePhaseResponse } from "@/types/conference.type";
import { formatCurrency } from "@/helper/format";
import { useAddPricePhaseForWaitlistMutation } from "@/redux/services/conferenceStep.service";
import { parseApiError } from "@/helper/api";

interface ResearchTimelineTabProps {
  conferenceId: string;
}

export function ResearchTimelineTab({ conferenceId }: ResearchTimelineTabProps) {
  const { data, isLoading, error } = useGetResearchConferenceDetailInternalQuery(conferenceId);
  const researchPrice = data?.data?.conferencePrices as ConferencePriceResponse[] || [];
  const researchPhases = [...(data?.data?.researchPhase || [])]
    .sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0));

  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [selectedPrices, setSelectedPrices] = useState<Record<string, Phase[]>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
  const [currentEditingPrice, setCurrentEditingPrice] = useState<string | null>(null);
  const [currentEditingPhaseIndex, setCurrentEditingPhaseIndex] = useState<number | null>(null);
  const [tempPhase, setTempPhase] = useState<Phase | null>(null);
  const [percentType, setPercentType] = useState<"increase" | "decrease">("increase");
  const [percentValue, setPercentValue] = useState(0);
  const [durationInDays, setDurationInDays] = useState(1);

  // Tìm phase có phaseOrder lớn nhất (phase cuối)
  const lastPhase = researchPhases.length > 0
    ? researchPhases[researchPhases.length - 1]
    : null;

  const authorPricesWithSlots = researchPrice.filter(
    price => price.isAuthor && (price.availableSlot ?? 0) > 0
  );

  const [addPricePhase, { isLoading: isSubmitting, error: submitError }] = useAddPricePhaseForWaitlistMutation();
  const [activateWaitlist, { isLoading: isActivating, error: activeError }] = useActivateWaitlistMutation();

  useEffect(() => {
    if (submitError) toast.error(parseApiError<string>(submitError)?.data?.message)
    if (activeError) toast.error(parseApiError<string>(activeError)?.data?.message)
  }, [submitError, activeError]);

  const calculateEndDate = (startDate: string, duration: number): string => {
    if (!startDate || duration <= 0) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    return end.toISOString().split("T")[0];
  };

  const maxDuration = useMemo(() => {
    if (!tempPhase?.startDate || !lastPhase?.registrationEndDate) return 1;
    const start = new Date(tempPhase.startDate);
    const saleEnd = new Date(lastPhase.registrationEndDate);
    const diffTime = saleEnd.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  }, [tempPhase?.startDate, lastPhase?.registrationEndDate]);

  const calculatedPrice = useMemo(() => {
    if (!currentEditingPrice || !percentValue) return 0;
    const price = authorPricesWithSlots.find(p => p.conferencePriceId === currentEditingPrice);
    if (!price) return 0;
    return price.ticketPrice !== undefined
      ? price.ticketPrice * (
        percentType === "increase"
          ? (100 + percentValue) / 100
          : (100 - percentValue) / 100
      )
      : 0;
  }, [currentEditingPrice, percentValue, percentType, authorPricesWithSlots]);

  const handleOpenAddPhaseDialog = (priceId: string) => {
    const newPhase: Phase = {
      phaseName: `Phase ${(selectedPrices[priceId] || []).length + 1}`,
      applyPercent: 100,
      startDate: lastPhase?.registrationStartDate || "",
      endDate: lastPhase?.registrationEndDate || "",
      totalslot: 0,
      refundInPhase: [],
      forWaitlist: true
    };
    setTempPhase(newPhase);
    setPercentType("increase");
    setPercentValue(0);
    setDurationInDays(1);
    setCurrentEditingPrice(priceId);
    setCurrentEditingPhaseIndex(null);
    setIsPhaseDialogOpen(true);
  };

  const handleOpenEditPhaseDialog = (priceId: string, phaseIndex: number) => {
    const phase = selectedPrices[priceId][phaseIndex];
    const calculatedPercentValue = phase.applyPercent > 100
      ? phase.applyPercent - 100
      : 100 - phase.applyPercent;
    const calculatedPercentType = phase.applyPercent > 100 ? "increase" : "decrease";
    const start = new Date(phase.startDate);
    const end = new Date(phase.endDate);
    const calculatedDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    setTempPhase({ ...phase });
    setPercentType(calculatedPercentType);
    setPercentValue(calculatedPercentValue);
    setDurationInDays(calculatedDuration);
    setCurrentEditingPrice(priceId);
    setCurrentEditingPhaseIndex(phaseIndex);
    setIsPhaseDialogOpen(true);
  };

  const handleSavePhase = () => {
    if (!currentEditingPrice || !tempPhase) return;
    const applyPercent = percentType === "increase"
      ? 100 + percentValue
      : 100 - percentValue;
    const phaseToSave = {
      ...tempPhase,
      applyPercent,
      endDate: calculateEndDate(tempPhase.startDate, durationInDays)
    };
    const currentPhases = selectedPrices[currentEditingPrice] || [];
    if (currentEditingPhaseIndex === null) {
      setSelectedPrices({
        ...selectedPrices,
        [currentEditingPrice]: [...currentPhases, phaseToSave]
      });
    } else {
      const updatedPhases = currentPhases.map((phase, idx) =>
        idx === currentEditingPhaseIndex ? phaseToSave : phase
      );
      setSelectedPrices({
        ...selectedPrices,
        [currentEditingPrice]: updatedPhases
      });
    }
    if (validationErrors[currentEditingPrice]) {
      setValidationErrors({ ...validationErrors, [currentEditingPrice]: "" });
    }
    setIsPhaseDialogOpen(false);
    setTempPhase(null);
    setCurrentEditingPrice(null);
    setCurrentEditingPhaseIndex(null);
    setPercentType("increase");
    setPercentValue(0);
    setDurationInDays(1);
  };

  const handleUpdateTempPhase = (field: keyof Phase, value: string | Date | number) => {
    if (!tempPhase) return;
    setTempPhase({ ...tempPhase, [field]: value });
  };

  const handleUpdateTempRefundPolicy = (
    refundIndex: number,
    field: keyof RefundInPhase,
    value: string | number
  ) => {
    if (!tempPhase) return;
    const updatedRefunds = (tempPhase.refundInPhase ?? []).map(
      (item) => item as RefundInPhase
    );
    updatedRefunds[refundIndex] = {
      ...updatedRefunds[refundIndex],
      [field]: value,
    };
    setTempPhase({ ...tempPhase, refundInPhase: updatedRefunds });
  };

  const handleAddTempRefundPolicy = () => {
    if (!tempPhase) return;
    const minDeadline = calculateMinRefundDate(tempPhase.startDate);
    const newRefund: RefundInPhase = {
      percentRefund: 100,
      refundDeadline: minDeadline
    };
    setTempPhase({
      ...tempPhase,
      refundInPhase: [...(tempPhase.refundInPhase || []), newRefund]
    });
  };

  const handleRemoveTempRefundPolicy = (refundIndex: number) => {
    if (!tempPhase) return;
    const updatedRefunds = (tempPhase.refundInPhase || []).filter((_, i) => i !== refundIndex);
    setTempPhase({ ...tempPhase, refundInPhase: updatedRefunds });
  };

  const calculateMinRefundDate = (startDate: string): string => {
    if (!startDate) return lastPhase?.registrationStartDate || "";
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split("T")[0];
  };

  const validatePhases = (priceId: string, phases: Phase[]): string | null => {
    if (!lastPhase) return "Không tìm thấy phase cuối cùng";
    const registrationStart = new Date(lastPhase.registrationStartDate!);
    const registrationEnd = new Date(lastPhase.registrationEndDate!);

    if (phases.length === 0) {
      return "Vui lòng thêm ít nhất một phase";
    }

    const sortedPhases = [...phases].sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const firstPhaseStart = new Date(sortedPhases[0].startDate);
    if (firstPhaseStart.getTime() !== registrationStart.getTime()) {
      return "Phase đầu tiên phải bắt đầu từ thời gian đăng ký của phase cuối";
    }

    const lastPhaseEnd = new Date(sortedPhases[sortedPhases.length - 1].endDate);
    if (lastPhaseEnd.getTime() !== registrationEnd.getTime()) {
      return "Phase cuối cùng phải kết thúc đúng thời gian kết thúc đăng ký của phase cuối";
    }

    for (let i = 0; i < sortedPhases.length - 1; i++) {
      const currentEnd = new Date(sortedPhases[i].endDate);
      const nextStart = new Date(sortedPhases[i + 1].startDate);
      if (currentEnd.getTime() !== nextStart.getTime()) {
        return `Phase "${sortedPhases[i].phaseName}" và "${sortedPhases[i + 1].phaseName}" không nối tiếp nhau`;
      }
    }

    const price = authorPricesWithSlots.find(p => p.conferencePriceId === priceId);
    if (price) {
      const totalSlots = phases.reduce((sum, phase) => sum + phase.totalslot, 0);
      if (totalSlots !== price.availableSlot) {
        return `Tổng số lượng của các phase (${totalSlots}) phải bằng số lượng của loại chi phí (${price.availableSlot})`;
      }
    }

    for (const phase of phases) {
      const phaseStart = new Date(phase.startDate);
      if (phase.refundInPhase && phase.refundInPhase.length > 0) {
        for (const refund of phase.refundInPhase) {
          if (!refund.refundDeadline) continue;
          const refundDeadline = new Date(refund.refundDeadline);
          if (refundDeadline <= phaseStart) {
            return `Refund deadline của phase "${phase.phaseName}" phải sau thời gian bắt đầu phase`;
          }
          if (refundDeadline > registrationEnd) {
            return `Refund deadline của phase "${phase.phaseName}" phải trước thời gian kết thúc đăng ký`;
          }
        }
      }
    }

    return null;
  };

  const handleRemovePhase = (priceId: string, phaseIndex: number) => {
    const currentPhases = selectedPrices[priceId] || [];
    setSelectedPrices({
      ...selectedPrices,
      [priceId]: currentPhases.filter((_, idx) => idx !== phaseIndex)
    });
  };

  const handleActivate = async () => {
    const errors: Record<string, string> = {};
    for (const price of authorPricesWithSlots) {
      const phases = selectedPrices[price.conferencePriceId];
      const error = validatePhases(price.conferencePriceId, phases || []);
      if (error) {
        errors[price.conferencePriceId] = error;
      }
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Vui lòng kiểm tra lại thông tin các phase");
      return;
    }
    try {
      for (const price of authorPricesWithSlots) {
        const phases = selectedPrices[price.conferencePriceId];
        if (phases && phases.length > 0) {
          await addPricePhase({
            conferencePriceId: price.conferencePriceId,
            data: { phases: phases }
          }).unwrap();
        }
      }
      toast.success("Đã tạo phases thành công!");
      await activateWaitlist(conferenceId).unwrap();
      toast.success("Kích hoạt phase cuối thành công!");
      setIsActivateModalOpen(false);
      setSelectedPrices({});
      setValidationErrors({});
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatRange = (start: string, end: string): string => {
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500 mr-2" />
        <span className="text-gray-600">Đang tải tiến trình nghiên cứu...</span>
      </div>
    );
  }

  if (error || researchPhases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Không tải được tiến trình nghiên cứu
        </h3>
        <p className="text-gray-500">
          {error
            ? "Đã xảy ra lỗi khi kết nối máy chủ."
            : "Hội nghị này chưa thiết lập tiến trình nghiên cứu."}
        </p>
      </div>
    );
  }

  const getTimelineSteps = (phase: ResearchConferencePhaseResponse) => [
    {
      title: "Đăng ký tham dự",
      start: phase.registrationStartDate,
      end: phase.registrationEndDate,
      icon: UserCheck,
      color: "text-blue-600",
    },
    {
      title: "Quyết định Abstract",
      start: phase.abstractDecideStatusStart,
      end: phase.abstractDecideStatusEnd,
      icon: MessageCircle,
      color: "text-amber-600",
    },
    {
      title: "Gửi Full Paper",
      start: phase.fullPaperStartDate,
      end: phase.fullPaperEndDate,
      icon: FileText,
      color: "text-emerald-600",
    },
    {
      title: "Review",
      start: phase.reviewStartDate,
      end: phase.reviewEndDate,
      icon: MessageCircle,
      color: "text-violet-600",
    },
    {
      title: "Quyết định Full Paper",
      start: phase.fullPaperDecideStatusStart,
      end: phase.fullPaperDecideStatusEnd,
      icon: PackageCheck,
      color: "text-indigo-600",
    },
    {
      title: "Chỉnh sửa & gửi lại",
      start: phase.reviseStartDate,
      end: phase.reviseEndDate,
      icon: Edit3,
      color: "text-orange-600",
    },
    {
      title: "Quyết định Paper Revision",
      start: phase.revisionPaperDecideStatusStart,
      end: phase.revisionPaperDecideStatusEnd,
      icon: PackageCheck,
      color: "text-fuchsia-600",
    },
    {
      title: "Gửi bản Camera Ready",
      start: phase.cameraReadyStartDate,
      end: phase.cameraReadyEndDate,
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Quyết định Camera Ready",
      start: phase.cameraReadyDecideStatusStart,
      end: phase.cameraReadyDecideStatusEnd,
      icon: PackageCheck,
      color: "text-teal-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Timeline Nghiên cứu</h3>
        </div>
        {lastPhase && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsActivateModalOpen(true)}
            className="flex items-center gap-1.5 border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            Kích hoạt pricing cho phase {lastPhase.phaseOrder}
          </Button>
        )}
      </div>

      {/* Render each Phase */}
      {researchPhases.map((phase) => (
        <div
          key={phase.researchConferencePhaseId}
          className="bg-white border border-gray-200 rounded-lg p-5 space-y-4"
        >
          {/* Phase Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <Workflow className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">
                Phase {phase.phaseOrder || 1}
              </h4>
            </div>
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${phase.isActive
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
                  }`}
              >
                {phase.isActive ? "Đang hoạt động" : "Dừng hoạt động"}
              </span>
            </div>
          </div>

          {/* Timeline Events with Icons */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            {getTimelineSteps(phase).map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className={`mt-0.5 p-1 rounded-full ${item.color.replace('text', 'bg').replace('-600', '-100')}`}>
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{item.title}</span>
                      <span className="text-xs text-gray-500">
                        {formatRange(item.start ?? '', item.end ?? '')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal Kích hoạt Phase */}
      <Dialog open={isActivateModalOpen} onOpenChange={setIsActivateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kích hoạt pricing cho phase {lastPhase?.phaseOrder}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!lastPhase ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy phase cuối cùng
              </div>
            ) : authorPricesWithSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có chi phí cho tác giả nào còn khả dụng
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                    Thông tin Phase {lastPhase.phaseOrder}
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>
                      <span className="font-medium">Thời gian đăng ký:</span>{" "}
                      {formatDate(lastPhase.registrationStartDate || "")} -{" "}
                      {formatDate(lastPhase.registrationEndDate || "")}
                    </div>
                  </div>
                </div>

                {authorPricesWithSlots.map((price) => (
                  <div key={price.conferencePriceId} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-base mb-1">
                          {price.ticketName}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {price.ticketDescription}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Giá:</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(price.ticketPrice || 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Slot khả dụng:</span>
                            <span className="font-semibold text-blue-600">
                              {price.availableSlot}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAddPhaseDialog(price.conferencePriceId)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        + Thêm Phase
                      </Button>
                    </div>

                    {validationErrors[price.conferencePriceId] && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                        {validationErrors[price.conferencePriceId]}
                      </div>
                    )}

                    <div className="space-y-2">
                      {(selectedPrices[price.conferencePriceId] || []).map((phase, phaseIndex) => (
                        <div key={phaseIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-2">{phase.phaseName}</h5>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Thời gian:</span>
                                  <div className="text-gray-900">
                                    {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Slot:</span>
                                  <span className="font-medium text-gray-900 ml-1">{phase.totalslot}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Giảm giá:</span>
                                  <span className="font-medium text-gray-900 ml-1">{phase.applyPercent}%</span>
                                </div>
                                {phase.refundInPhase && phase.refundInPhase.length > 0 && (
                                  <div>
                                    <span className="text-gray-600">Chính sách hoàn:</span>
                                    <span className="font-medium text-gray-900 ml-1">
                                      {phase.refundInPhase.length} mức
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditPhaseDialog(price.conferencePriceId, phaseIndex)}
                                className="text-blue-600 border-blue-300 hover:bg-blue-50 h-8 px-3"
                              >
                                Sửa
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemovePhase(price.conferencePriceId, phaseIndex)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3"
                              >
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>Hủy</Button>
            </DialogClose>
            <Button
              onClick={handleActivate}
              disabled={isSubmitting || isActivating || authorPricesWithSlots.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Kích hoạt"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog thêm/sửa Phase */}
      <Dialog open={isPhaseDialogOpen} onOpenChange={setIsPhaseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentEditingPhaseIndex === null ? "Thêm Phase" : "Chỉnh sửa Phase"}
            </DialogTitle>
            {lastPhase && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                  Thông tin Phase {lastPhase.phaseOrder}
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>
                    <span className="font-medium">Thời gian đăng ký:</span>{" "}
                    {formatDate(lastPhase.registrationStartDate || "")} -{" "}
                    {formatDate(lastPhase.registrationEndDate || "")}
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>
          {tempPhase && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Tên phase
                </label>
                <input
                  type="text"
                  value={tempPhase.phaseName}
                  onChange={(e) => handleUpdateTempPhase('phaseName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Early Bird, Standard, Late..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Điều chỉnh giá</label>
                <div className="flex items-end gap-3">
                  <div className="w-24">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={percentValue}
                      onChange={(e) => setPercentValue(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="percentType"
                        value="increase"
                        checked={percentType === "increase"}
                        onChange={() => setPercentType("increase")}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-red-600 font-medium">Tăng</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="percentType"
                        value="decrease"
                        checked={percentType === "decrease"}
                        onChange={() => setPercentType("decrease")}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-green-600 font-medium">Giảm</span>
                    </label>
                  </div>
                  {currentEditingPrice && percentValue > 0 && (
                    <div className="text-sm bg-gray-50 p-2 rounded">
                      <strong
                        className={
                          percentType === "increase"
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {calculatedPrice.toLocaleString()} VND
                      </strong>
                      {" "}(
                      {percentType === "increase" ? "+" : "-"}
                      {percentValue}%)
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={tempPhase.startDate ? new Date(tempPhase.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      const isoDateTime = new Date(selectedDate + 'T00:00:00').toISOString();
                      handleUpdateTempPhase('startDate', isoDateTime);
                    }}
                    min={lastPhase?.registrationStartDate ? new Date(lastPhase.registrationStartDate).toISOString().split('T')[0] : ''}
                    max={lastPhase?.registrationEndDate ? new Date(lastPhase.registrationEndDate).toISOString().split('T')[0] : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Số ngày
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxDuration}
                    value={durationInDays}
                    onChange={(e) => {
                      const numVal = Number(e.target.value);
                      if (numVal > maxDuration) return;
                      setDurationInDays(numVal);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ngày kết thúc
                  </label>
                  <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
                    {tempPhase.startDate && durationInDays > 0 ? (
                      <span className="text-gray-900">
                        {new Date(calculateEndDate(tempPhase.startDate, durationInDays)).toLocaleDateString("vi-VN")}
                      </span>
                    ) : (
                      <span className="text-gray-400">--/--/----</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Số slot (Tối đa: {currentEditingPrice ? authorPricesWithSlots.find(p => p.conferencePriceId === currentEditingPrice)?.availableSlot : 0})
                  </label>
                  <input
                    type="number"
                    value={tempPhase.totalslot}
                    onChange={(e) => handleUpdateTempPhase('totalslot', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max={currentEditingPrice ? authorPricesWithSlots.find(p => p.conferencePriceId === currentEditingPrice)?.availableSlot : undefined}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-sm text-red-600">
                    Chính sách hoàn tiền
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddTempRefundPolicy}
                    className="text-xs h-7"
                  >
                    + Thêm mức hoàn
                  </Button>
                </div>
                <div className="space-y-2">
                  {(tempPhase.refundInPhase || []).map((refund, refundIndex) => {
                    const minRefundDate = calculateMinRefundDate(tempPhase.startDate);
                    const maxRefundDate = lastPhase?.registrationEndDate
                      ? new Date(lastPhase.registrationEndDate).toISOString().split('T')[0]
                      : '';
                    return (
                      <div key={refundIndex} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-end">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {refundIndex === 0 ? "Tỷ lệ hoàn (%)" : ""}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={refund.percentRefund}
                            onChange={(e) =>
                              handleUpdateTempRefundPolicy(refundIndex, 'percentRefund', Number(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {refundIndex === 0 ? (
                              <span className="flex items-center gap-1">
                                Hạn hoàn tiền
                                <span className="text-xs text-blue-600 font-normal">
                                  (≤ Registration End)
                                </span>
                              </span>
                            ) : ""}
                          </label>
                          <input
                            type="date"
                            value={refund.refundDeadline ? new Date(refund.refundDeadline).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              const isoDateTime = new Date(selectedDate + 'T23:59:59').toISOString();
                              handleUpdateTempRefundPolicy(refundIndex, 'refundDeadline', isoDateTime);
                            }}
                            min={minRefundDate}
                            max={maxRefundDate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        {(tempPhase.refundInPhase || []).length > 1 && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveTempRefundPolicy(refundIndex)}
                            className="h-[42px] w-[42px] p-0 flex items-center justify-center text-sm"
                            title="Xoá mức hoàn"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button onClick={handleSavePhase} className="bg-blue-600 hover:bg-blue-700">
              {currentEditingPhaseIndex === null ? "Thêm" : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// // components/pages/ConferenceDetailPage/Tab/ResearchTimelineTab.tsx
// "use client";

// import {
//   Info,
//   Clock,
//   User,
//   UserCheck,
//   FileText,
//   MessageCircle,
//   Edit3,
//   PackageCheck,
//   Workflow
// } from "lucide-react";
// import { useActivateWaitlistMutation, useGetResearchConferenceDetailInternalQuery } from "@/redux/services/conference.service";
// import { Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { useEffect, useMemo, useState } from "react";
// import { toast } from "sonner";
// import { ConferencePriceResponse, Phase, RefundInPhase, RefundPolicyResponse, ResearchConferencePhaseResponse, ResearchDetail, ResearchPhase, Ticket } from "@/types/conference.type";
// import { ResearchPriceForm } from "@/components/molecules/Conference/ConferenceStep/forms/research/ResearchPriceForm";
// import { formatCurrency } from "@/helper/format";
// import { useAddPricePhaseForWaitlistMutation } from "@/redux/services/conferenceStep.service";
// import { parseApiError } from "@/helper/api";

// interface ResearchConferencePhase {
//   researchConferencePhaseId: string;
//   conferenceId: string;
//   registrationStartDate: string;
//   registrationEndDate: string;
//   fullPaperStartDate: string;
//   fullPaperEndDate: string;
//   reviewStartDate: string;
//   reviewEndDate: string;
//   reviseStartDate: string;
//   reviseEndDate: string;
//   cameraReadyStartDate: string;
//   cameraReadyEndDate: string;
//   isWaitlist: boolean;
//   isActive: boolean;
// }

// interface ResearchTimelineTabProps {
//   conferenceId: string;
// }

// export function ResearchTimelineTab({ conferenceId }: ResearchTimelineTabProps) {
//   const { data, isLoading, error } = useGetResearchConferenceDetailInternalQuery(conferenceId);
//   const researchPrice = data?.data?.conferencePrices as ConferencePriceResponse[] || [];
//   const researchPhases = data?.data?.researchPhase as ResearchConferencePhaseResponse[] || [];

//   const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
//   const [selectedStatus, setSelectedStatus] = useState<"active" | "inactive">("active");

//   const [selectedPrices, setSelectedPrices] = useState<Record<string, Phase[]>>({});
//   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

//   const [phaseRefunds, setPhaseRefunds] = useState<Record<string, Record<number, RefundInPhase[]>>>({});

//   const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
//   const [currentEditingPrice, setCurrentEditingPrice] = useState<string | null>(null);
//   const [currentEditingPhaseIndex, setCurrentEditingPhaseIndex] = useState<number | null>(null);
//   const [tempPhase, setTempPhase] = useState<Phase | null>(null);

//   const [percentType, setPercentType] = useState<"increase" | "decrease">("increase");
//   const [percentValue, setPercentValue] = useState(0);
//   const [durationInDays, setDurationInDays] = useState(1);

//   const waitlistPhase = researchPhases.find(phase => phase.isWaitlist);

//   const authorPricesWithSlots = researchPrice.filter(
//     price => price.isAuthor && (price.availableSlot ?? 0) > 0
//   );

//   const [addPricePhase, { isLoading: isSubmitting, error: submitError }] = useAddPricePhaseForWaitlistMutation();
//   const [activateWaitlist, { isLoading: isActivating, error: activeError }] = useActivateWaitlistMutation();

//   useEffect(() => {
//     if (submitError) toast.error(parseApiError<string>(submitError)?.data?.message)
//     if (activeError) toast.error(parseApiError<string>(activeError)?.data?.message)
//   }, [submitError, activeError]);

//   const calculateEndDate = (startDate: string, duration: number): string => {
//     if (!startDate || duration <= 0) return "";
//     const start = new Date(startDate);
//     const end = new Date(start);
//     end.setDate(start.getDate() + duration - 1);
//     return end.toISOString().split("T")[0];
//   };

//   const maxDuration = useMemo(() => {
//     if (!tempPhase?.startDate || !waitlistPhase?.registrationEndDate) return 1;
//     const start = new Date(tempPhase.startDate);
//     const saleEnd = new Date(waitlistPhase.registrationEndDate);
//     const diffTime = saleEnd.getTime() - start.getTime();
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
//     return Math.max(1, diffDays);
//   }, [tempPhase?.startDate, waitlistPhase?.registrationEndDate]);

//   const calculatedPrice = useMemo(() => {
//     if (!currentEditingPrice || !percentValue) return 0;
//     const price = authorPricesWithSlots.find(p => p.conferencePriceId === currentEditingPrice);
//     if (!price) return 0;

//     return price.ticketPrice !== undefined
//       ? price.ticketPrice * (
//         percentType === "increase"
//           ? (100 + percentValue) / 100
//           : (100 - percentValue) / 100
//       )
//       : 0;
//   }, [currentEditingPrice, percentValue, percentType, authorPricesWithSlots]);

//   // Mở dialog để thêm phase mới
//   const handleOpenAddPhaseDialog = (priceId: string) => {
//     const newPhase: Phase = {
//       phaseName: `Phase ${(selectedPrices[priceId] || []).length + 1}`,
//       applyPercent: 100,
//       startDate: waitlistPhase?.registrationStartDate || "",
//       endDate: waitlistPhase?.registrationEndDate || "",
//       totalslot: 0,
//       refundInPhase: [],
//       forWaitlist: true
//     };

//     setTempPhase(newPhase);
//     setPercentType("increase");
//     setPercentValue(0);
//     setDurationInDays(1);
//     setCurrentEditingPrice(priceId);
//     setCurrentEditingPhaseIndex(null);
//     setIsPhaseDialogOpen(true);
//   };

//   // Mở dialog để edit phase
//   const handleOpenEditPhaseDialog = (priceId: string, phaseIndex: number) => {
//     const phase = selectedPrices[priceId][phaseIndex];

//     // Tính percent và type từ applyPercent
//     const calculatedPercentValue = phase.applyPercent > 100
//       ? phase.applyPercent - 100
//       : 100 - phase.applyPercent;
//     const calculatedPercentType = phase.applyPercent > 100 ? "increase" : "decrease";

//     // Tính duration
//     const start = new Date(phase.startDate);
//     const end = new Date(phase.endDate);
//     const calculatedDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

//     setTempPhase({ ...phase });
//     setPercentType(calculatedPercentType);
//     setPercentValue(calculatedPercentValue);
//     setDurationInDays(calculatedDuration);
//     setCurrentEditingPrice(priceId);
//     setCurrentEditingPhaseIndex(phaseIndex);
//     setIsPhaseDialogOpen(true);
//   };

//   // Lưu phase (thêm mới hoặc update)
//   const handleSavePhase = () => {
//     if (!currentEditingPrice || !tempPhase) return;

//     const applyPercent = percentType === "increase"
//       ? 100 + percentValue
//       : 100 - percentValue;

//     const phaseToSave = {
//       ...tempPhase,
//       applyPercent,
//       endDate: calculateEndDate(tempPhase.startDate, durationInDays)
//     };

//     const currentPhases = selectedPrices[currentEditingPrice] || [];

//     if (currentEditingPhaseIndex === null) {
//       setSelectedPrices({
//         ...selectedPrices,
//         [currentEditingPrice]: [...currentPhases, phaseToSave]
//       });
//     } else {
//       const updatedPhases = currentPhases.map((phase, idx) =>
//         idx === currentEditingPhaseIndex ? phaseToSave : phase
//       );
//       setSelectedPrices({
//         ...selectedPrices,
//         [currentEditingPrice]: updatedPhases
//       });
//     }

//     if (validationErrors[currentEditingPrice]) {
//       setValidationErrors({ ...validationErrors, [currentEditingPrice]: "" });
//     }

//     setIsPhaseDialogOpen(false);
//     setTempPhase(null);
//     setCurrentEditingPrice(null);
//     setCurrentEditingPhaseIndex(null);
//     setPercentType("increase");
//     setPercentValue(0);
//     setDurationInDays(1);
//   };

//   // Update tempPhase
//   const handleUpdateTempPhase = (field: keyof Phase, value: string | Date | number) => {
//     if (!tempPhase) return;
//     setTempPhase({ ...tempPhase, [field]: value });
//   };

//   // Update refund trong tempPhase
//   const handleUpdateTempRefundPolicy = (
//     refundIndex: number,
//     field: keyof RefundInPhase,
//     value: string | number
//   ) => {
//     if (!tempPhase) return;
//     const updatedRefunds = (tempPhase.refundInPhase ?? []).map(
//       (item) => item as RefundInPhase
//     );

//     updatedRefunds[refundIndex] = {
//       ...updatedRefunds[refundIndex],
//       [field]: value,
//     };
//     // const updatedRefunds = [...(tempPhase.refundInPhase || [])];
//     // updatedRefunds[refundIndex][field] = value;
//     setTempPhase({ ...tempPhase, refundInPhase: updatedRefunds });
//   };

//   const handleAddTempRefundPolicy = () => {
//     if (!tempPhase) return;
//     const minDeadline = calculateMinRefundDate(tempPhase.startDate);
//     const newRefund: RefundInPhase = {
//       percentRefund: 100,
//       refundDeadline: minDeadline
//     };
//     setTempPhase({
//       ...tempPhase,
//       refundInPhase: [...(tempPhase.refundInPhase || []), newRefund]
//     });
//   };

//   const handleRemoveTempRefundPolicy = (refundIndex: number) => {
//     if (!tempPhase) return;
//     const updatedRefunds = (tempPhase.refundInPhase || []).filter((_, i) => i !== refundIndex);
//     setTempPhase({ ...tempPhase, refundInPhase: updatedRefunds });
//   };

//   // // Handler thêm refund policy
//   // const handleAddRefundPolicy = (priceId: string, phaseIndex: number) => {
//   //   const phase = selectedPrices[priceId][phaseIndex];
//   //   const minDeadline = calculateMinRefundDate(phase.startDate);

//   //   const newRefund: RefundInPhase = {
//   //     percentRefund: 100,
//   //     refundDeadline: minDeadline
//   //   };

//   //   const currentRefunds = phase.refundInPhase || [];

//   //   handleUpdatePhase(priceId, phaseIndex, 'refundInPhase', [...currentRefunds, newRefund]);
//   // };

//   // // Handler xóa refund policy
//   // const handleRemoveRefundPolicy = (priceId: string, phaseIndex: number, refundIndex: number) => {
//   //   const phase = selectedPrices[priceId][phaseIndex];
//   //   const updatedRefunds = (phase.refundInPhase || []).filter((_, i) => i !== refundIndex);

//   //   handleUpdatePhase(priceId, phaseIndex, 'refundInPhase', updatedRefunds);
//   // };

//   // // Handler cập nhật refund policy
//   // const handleUpdateRefundPolicy = (
//   //   priceId: string,
//   //   phaseIndex: number,
//   //   refundIndex: number,
//   //   field: keyof RefundInPhase,
//   //   value: string | number
//   // ) => {
//   //   const phase = selectedPrices[priceId][phaseIndex];
//   //   const updatedRefunds = [...(phase.refundInPhase || [])];
//   //   // @ts-expect-error — field type is constrained by usage
//   //   updatedRefunds[refundIndex][field] = value;

//   //   handleUpdatePhase(priceId, phaseIndex, 'refundInPhase', updatedRefunds);
//   // };

//   // Helper function tính min refund date
//   const calculateMinRefundDate = (startDate: string): string => {
//     if (!startDate) return waitlistPhase?.registrationStartDate || "";
//     const nextDay = new Date(startDate);
//     nextDay.setDate(nextDay.getDate() + 1);
//     return nextDay.toISOString().split("T")[0];
//   };

//   // Validation function
//   const validatePhases = (priceId: string, phases: Phase[]): string | null => {
//     if (!waitlistPhase) return "Không tìm thấy waitlist phase";

//     const registrationStart = new Date(waitlistPhase.registrationStartDate!);
//     const registrationEnd = new Date(waitlistPhase.registrationEndDate!);

//     // Kiểm tra có phase không
//     if (phases.length === 0) {
//       return "Vui lòng thêm ít nhất một phase";
//     }

//     // Sắp xếp phases theo startDate
//     const sortedPhases = [...phases].sort((a, b) =>
//       new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
//     );

//     // Kiểm tra phase đầu tiên phải bắt đầu từ registrationStart
//     const firstPhaseStart = new Date(sortedPhases[0].startDate);
//     if (firstPhaseStart.getTime() !== registrationStart.getTime()) {
//       return "Phase đầu tiên phải bắt đầu từ thời gian đăng ký của waitlist";
//     }

//     // Kiểm tra phase cuối cùng phải kết thúc đúng registrationEnd
//     const lastPhaseEnd = new Date(sortedPhases[sortedPhases.length - 1].endDate);
//     if (lastPhaseEnd.getTime() !== registrationEnd.getTime()) {
//       return "Phase cuối cùng phải kết thúc đúng thời gian kết thúc đăng ký của waitlist";
//     }

//     // Kiểm tra các phase phải nối tiếp nhau
//     for (let i = 0; i < sortedPhases.length - 1; i++) {
//       const currentEnd = new Date(sortedPhases[i].endDate);
//       const nextStart = new Date(sortedPhases[i + 1].startDate);

//       if (currentEnd.getTime() !== nextStart.getTime()) {
//         return `Phase "${sortedPhases[i].phaseName}" và "${sortedPhases[i + 1].phaseName}" không nối tiếp nhau`;
//       }
//     }

//     // Kiểm tra tổng slot
//     const price = authorPricesWithSlots.find(p => p.conferencePriceId === priceId);
//     if (price) {
//       const totalSlots = phases.reduce((sum, phase) => sum + phase.totalslot, 0);
//       if (totalSlots !== price.availableSlot) {
//         return `Tổng số lượng của các phase (${totalSlots}) phải bằng số lượng của loại chi phí (${price.availableSlot})`;
//       }
//     }

//     // Kiểm tra refund policies
//     for (const phase of phases) {
//       const phaseStart = new Date(phase.startDate);

//       if (phase.refundInPhase && phase.refundInPhase.length > 0) {
//         for (const refund of phase.refundInPhase) {
//           if (!refund.refundDeadline) {
//             continue;
//           }

//           const refundDeadline = new Date(refund.refundDeadline);

//           if (refundDeadline <= phaseStart) {
//             return `Refund deadline của phase "${phase.phaseName}" phải sau thời gian bắt đầu phase`;
//           }

//           if (refundDeadline > registrationEnd) {
//             return `Refund deadline của phase "${phase.phaseName}" phải trước thời gian kết thúc đăng ký`;
//           }
//         }
//       }
//     }

//     return null;
//   };

//   const handleAddPhase = (priceId: string) => {
//     const currentPhases = selectedPrices[priceId] || [];
//     const newPhase: Phase = {
//       phaseName: `Phase ${currentPhases.length + 1}`,
//       applyPercent: 0,
//       startDate: waitlistPhase?.registrationStartDate || "",
//       endDate: waitlistPhase?.registrationEndDate || "",
//       totalslot: 0,
//       refundInPhase: [],
//       forWaitlist: true
//     };

//     setSelectedPrices({
//       ...selectedPrices,
//       [priceId]: [...currentPhases, newPhase]
//     });
//   };

//   // Handle xóa phase
//   const handleRemovePhase = (priceId: string, phaseIndex: number) => {
//     const currentPhases = selectedPrices[priceId] || [];
//     setSelectedPrices({
//       ...selectedPrices,
//       [priceId]: currentPhases.filter((_, idx) => idx !== phaseIndex)
//     });
//   };

//   // Handle cập nhật phase
//   const handleUpdatePhase = (priceId: string, phaseIndex: number, field: keyof Phase, value: Phase) => {
//     const currentPhases = selectedPrices[priceId] || [];
//     const updatedPhases = currentPhases.map((phase, idx) =>
//       idx === phaseIndex ? { ...phase, [field]: value } : phase
//     );

//     setSelectedPrices({
//       ...selectedPrices,
//       [priceId]: updatedPhases
//     });

//     if (validationErrors[priceId]) {
//       setValidationErrors({ ...validationErrors, [priceId]: "" });
//     }
//   };

//   // Handle submit
//   const handleActivate = async () => {
//     const errors: Record<string, string> = {};

//     for (const price of authorPricesWithSlots) {
//       const phases = selectedPrices[price.conferencePriceId];
//       const error = validatePhases(price.conferencePriceId, phases || []);

//       if (error) {
//         errors[price.conferencePriceId] = error;
//       }
//     }

//     if (Object.keys(errors).length > 0) {
//       setValidationErrors(errors);
//       toast.error("Vui lòng kiểm tra lại thông tin các phase");
//       return;
//     }

//     try {
//       for (const price of authorPricesWithSlots) {
//         const phases = selectedPrices[price.conferencePriceId];
//         if (phases && phases.length > 0) {
//           await addPricePhase({
//             conferencePriceId: price.conferencePriceId,
//             data: { phases: phases }
//           }).unwrap();
//         }
//       }

//       toast.success("Đã tạo phases thành công!");

//       await activateWaitlist(conferenceId).unwrap();

//       toast.success("Kích hoạt waitlist thành công!");
//       // toast.success("Đã kích hoạt các phase cho waitlist thành công!");
//       setIsActivateModalOpen(false);
//       setSelectedPrices({});
//       setValidationErrors({});
//     } catch (error) {
//       // toast.error("Có lỗi xảy ra khi kích hoạt phase");
//       console.error(error);
//     }
//   };

//   const formatDate = (dateStr: string): string => {
//     if (!dateStr) return "—";
//     return new Date(dateStr).toLocaleDateString("vi-VN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   const formatRange = (start: string, end: string): string => {
//     return `${formatDate(start)} – ${formatDate(end)}`;
//   };

//   // const handleActivate = () => {
//   //   console.log("Cập nhật trạng thái:", selectedStatus);
//   //   toast.success(
//   //     selectedStatus === "active"
//   //       ? "Đã kích hoạt tiến trình nghiên cứu!"
//   //       : "Đã tạm dừng tiến trình nghiên cứu!"
//   //   );
//   //   setIsActivateModalOpen(false);
//   // };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <Loader2 className="w-6 h-6 animate-spin text-gray-500 mr-2" />
//         <span className="text-gray-600">Đang tải tiến trình nghiên cứu...</span>
//       </div>
//     );
//   }

//   if (error || researchPhases.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Info className="w-8 h-8 text-gray-400" />
//         </div>
//         <h3 className="text-xl font-semibold text-gray-900 mb-2">
//           Không tải được tiến trình nghiên cứu
//         </h3>
//         <p className="text-gray-500">
//           {error
//             ? "Đã xảy ra lỗi khi kết nối máy chủ."
//             : "Hội nghị này chưa thiết lập tiến trình nghiên cứu."}
//         </p>
//       </div>
//     );
//   }

//   // Định nghĩa các mốc với icon riêng
//   const getTimelineSteps = (phase: ResearchConferencePhaseResponse) => [
//     {
//       title: "Đăng ký tham dự",
//       start: phase.registrationStartDate,
//       end: phase.registrationEndDate,
//       icon: UserCheck,
//       color: "text-blue-600",
//     },
//     {
//       title: "Quyết định Abstract",
//       start: phase.abstractDecideStatusStart,
//       end: phase.abstractDecideStatusEnd,
//       icon: MessageCircle,
//       color: "text-amber-600",
//     },
//     {
//       title: "Gửi Full Paper",
//       start: phase.fullPaperStartDate,
//       end: phase.fullPaperEndDate,
//       icon: FileText,
//       color: "text-emerald-600",
//     },
//     {
//       title: "Review",
//       start: phase.reviewStartDate,
//       end: phase.reviewEndDate,
//       icon: MessageCircle,
//       color: "text-violet-600",
//     },
//     {
//       title: "Quyết định Full Paper",
//       start: phase.fullPaperDecideStatusStart,
//       end: phase.fullPaperDecideStatusEnd,
//       icon: PackageCheck,
//       color: "text-indigo-600",
//     },
//     {
//       title: "Chỉnh sửa & gửi lại",
//       start: phase.reviseStartDate,
//       end: phase.reviseEndDate,
//       icon: Edit3,
//       color: "text-orange-600",
//     },
//     // {
//     //   title: "Phản biện bản chỉnh sửa",
//     //   start: phase.revisionPaperReviewStart,
//     //   end: phase.revisionPaperReviewEnd,
//     //   icon: MessageCircle,
//     //   color: "text-rose-600",
//     // },
//     {
//       title: "Quyết định Paper Revision",
//       start: phase.revisionPaperDecideStatusStart,
//       end: phase.revisionPaperDecideStatusEnd,
//       icon: PackageCheck,
//       color: "text-fuchsia-600",
//     },
//     {
//       title: "Gửi bản Camera Ready",
//       start: phase.cameraReadyStartDate,
//       end: phase.cameraReadyEndDate,
//       icon: FileText,
//       color: "text-green-600",
//     },
//     {
//       title: "Quyết định Camera Ready",
//       start: phase.cameraReadyDecideStatusStart,
//       end: phase.cameraReadyDecideStatusEnd,
//       icon: PackageCheck,
//       color: "text-teal-600",
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div className="flex items-center gap-2 text-gray-700">
//           <Clock className="w-5 h-5" />
//           <h3 className="text-lg font-semibold">Timeline Nghiên cứu</h3>
//         </div>
//         <Button
//           size="sm"
//           variant="outline"
//           onClick={() => setIsActivateModalOpen(true)}
//           className="flex items-center gap-1.5 border-blue-500 text-blue-600 hover:bg-blue-50"
//         >
//           Kích hoạt giai đoạn cho người dùng trong watlist
//         </Button>
//       </div>

//       {/* Render each Phase */}
//       {researchPhases.map((phase, index) => (
//         <div
//           key={phase.researchConferencePhaseId}
//           className="bg-white border border-gray-200 rounded-lg p-5 space-y-4"
//         >
//           {/* Phase Header */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8  rounded-full flex items-center justify-center">
//                 <Workflow className="w-4 h-4 text-blue-600" />
//               </div>
//               <h4 className="font-medium text-gray-900">
//                 Giai đoạn {index + 1}
//               </h4>
//             </div>

//             {/* Status Badges — màu mới */}
//             <div className="flex items-center gap-2">
//               <span
//                 className={`px-2 py-1 rounded-full text-xs font-medium ${phase.isActive
//                   ? "bg-emerald-100 text-emerald-800"
//                   : "bg-amber-100 text-amber-800"
//                   }`}
//               >
//                 {phase.isActive ? "Đang hoạt động" : "Dừng hoạt động"}
//               </span>
//               <span
//                 className={`px-2 py-1 rounded-full text-xs font-medium ${phase.isWaitlist
//                   ? "bg-violet-100 text-violet-800"
//                   : "bg-sky-100 text-sky-800"
//                   }`}
//               >
//                 {phase.isWaitlist ? "Waitlist" : "Main"}
//               </span>
//             </div>
//           </div>

//           {/* Timeline Events with Icons */}
//           <div className="space-y-3 pt-3 border-t border-gray-100">
//             {getTimelineSteps(phase).map((item, i) => {
//               const Icon = item.icon;
//               return (
//                 <div
//                   key={i}
//                   className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
//                 >
//                   <div className={`mt-0.5 p-1 rounded-full ${item.color.replace('text', 'bg').replace('-600', '-100')}`}>
//                     <Icon className={`w-3.5 h-3.5 ${item.color}`} />
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm font-medium text-gray-900">{item.title}</span>
//                       <span className="text-xs text-gray-500">
//                         {formatRange(item.start ?? '', item.end ?? '')}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       ))}

//       {/* Modal Kích hoạt Phase */}
//       <Dialog open={isActivateModalOpen} onOpenChange={setIsActivateModalOpen}>
//         {/* <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6"> */}
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Kích hoạt phase cho waitlist</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-6 py-4">
//             {!waitlistPhase ? (
//               <div className="text-center py-8 text-gray-500">
//                 Không tìm thấy waitlist phase
//               </div>
//             ) : authorPricesWithSlots.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 Không có chi phí cho tác giả nào còn khả dụng
//               </div>
//             ) : (
//               <>
//                 {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <h4 className="font-medium text-blue-900 mb-2">Thông tin Waitlist Phase</h4>
//                   <div className="text-sm text-blue-700">
//                     <div>Thời gian đăng ký: {formatDate(waitlistPhase.registrationStartDate || "")} - {formatDate(waitlistPhase.registrationEndDate || "")}</div>
//                   </div>
//                 </div> */}
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//                   <h4 className="font-semibold text-blue-900 mb-2 text-sm">
//                     Thông tin Waitlist Phase
//                   </h4>
//                   <div className="text-sm text-blue-700 space-y-1">
//                     <div>
//                       <span className="font-medium">Thời gian đăng ký:</span>{" "}
//                       {formatDate(waitlistPhase.registrationStartDate || "")} -{" "}
//                       {formatDate(waitlistPhase.registrationEndDate || "")}
//                     </div>
//                   </div>
//                 </div>

//                 {authorPricesWithSlots.map((price) => (
//                   <div key={price.conferencePriceId} className="border border-gray-200 rounded-lg p-4 space-y-4">
//                     <div className="flex justify-between items-start pb-3 border-b border-gray-100">
//                       <div className="flex-1">
//                         <h4 className="font-semibold text-gray-900 text-base mb-1">
//                           {price.ticketName}
//                         </h4>
//                         <p className="text-sm text-gray-600 mb-2">
//                           {price.ticketDescription}
//                         </p>
//                         <div className="flex gap-4 text-sm">
//                           <div className="flex items-center gap-1">
//                             <span className="text-gray-500">Giá:</span>
//                             <span className="font-semibold text-gray-900">
//                               {formatCurrency(price.ticketPrice || 0)}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <span className="text-gray-500">Slot khả dụng:</span>
//                             <span className="font-semibold text-blue-600">
//                               {price.availableSlot}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         // onClick={() => handleAddPhase(price.conferencePriceId)}
//                         onClick={() => handleOpenAddPhaseDialog(price.conferencePriceId)}
//                         className="text-blue-600 border-blue-300 hover:bg-blue-50"
//                       >
//                         + Thêm Phase
//                       </Button>
//                     </div>
//                     {/* <div className="flex justify-between items-start">
//                       <div>
//                         <h4 className="font-semibold text-gray-900">{price.ticketName}</h4>
//                         <p className="text-sm text-gray-600">{price.ticketDescription}</p>
//                         <div className="flex gap-4 mt-2 text-sm">
//                           <span className="text-gray-700">
//                             Giá: <span className="font-medium">{formatCurrency(price.ticketPrice || 0)}</span>
//                           </span>
//                           <span className="text-gray-700">
//                             Slot khả dụng: <span className="font-medium text-blue-600">{price.availableSlot}</span>
//                           </span>
//                         </div>
//                       </div>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleAddPhase(price.conferencePriceId)}
//                         className="text-blue-600 border-blue-300"
//                       >
//                         + Thêm Phase
//                       </Button>
//                     </div> */}

//                     {validationErrors[price.conferencePriceId] && (
//                       <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
//                         {validationErrors[price.conferencePriceId]}
//                       </div>
//                     )}

//                     <div className="space-y-2">
//                       {(selectedPrices[price.conferencePriceId] || []).map((phase, phaseIndex) => (
//                         <div key={phaseIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
//                           <div className="flex justify-between items-start">
//                             <div className="flex-1">
//                               <h5 className="font-semibold text-gray-900 mb-2">{phase.phaseName}</h5>
//                               <div className="grid grid-cols-2 gap-2 text-sm">
//                                 <div>
//                                   <span className="text-gray-600">Thời gian:</span>
//                                   <div className="text-gray-900">
//                                     {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
//                                   </div>
//                                 </div>
//                                 <div>
//                                   <span className="text-gray-600">Slot:</span>
//                                   <span className="font-medium text-gray-900 ml-1">{phase.totalslot}</span>
//                                 </div>
//                                 <div>
//                                   <span className="text-gray-600">Giảm giá:</span>
//                                   <span className="font-medium text-gray-900 ml-1">{phase.applyPercent}%</span>
//                                 </div>
//                                 {phase.refundInPhase && phase.refundInPhase.length > 0 && (
//                                   <div>
//                                     <span className="text-gray-600">Chính sách hoàn:</span>
//                                     <span className="font-medium text-gray-900 ml-1">
//                                       {phase.refundInPhase.length} mức
//                                     </span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                             <div className="flex gap-2 ml-3">
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleOpenEditPhaseDialog(price.conferencePriceId, phaseIndex)}
//                                 className="text-blue-600 border-blue-300 hover:bg-blue-50 h-8 px-3"
//                               >
//                                 Sửa
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="ghost"
//                                 onClick={() => handleRemovePhase(price.conferencePriceId, phaseIndex)}
//                                 className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3"
//                               >
//                                 Xóa
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </>
//             )}
//           </div>

//           <DialogFooter className="gap-2">
//             <DialogClose asChild>
//               <Button variant="outline" disabled={isSubmitting}>Hủy</Button>
//             </DialogClose>
//             <Button
//               onClick={handleActivate}
//               disabled={isSubmitting || isActivating || authorPricesWithSlots.length === 0}
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   Đang xử lý...
//                 </>
//               ) : (
//                 "Kích hoạt"
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={isPhaseDialogOpen} onOpenChange={setIsPhaseDialogOpen}>
//         <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               {currentEditingPhaseIndex === null ? "Thêm Phase" : "Chỉnh sửa Phase"}
//             </DialogTitle>
//             {waitlistPhase && (
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//                 <h4 className="font-semibold text-blue-900 mb-2 text-sm">
//                   Thông tin Waitlist Phase
//                 </h4>
//                 <div className="text-sm text-blue-700 space-y-1">
//                   <div>
//                     <span className="font-medium">Thời gian đăng ký:</span>{" "}
//                     {formatDate(waitlistPhase.registrationStartDate || "")} -{" "}
//                     {formatDate(waitlistPhase.registrationEndDate || "")}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </DialogHeader>

//           {tempPhase && (
//             <div className="space-y-4 py-4">
//               {/* Tên phase */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1.5">
//                   Tên phase
//                 </label>
//                 <input
//                   type="text"
//                   value={tempPhase.phaseName}
//                   onChange={(e) => handleUpdateTempPhase('phaseName', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Early Bird, Standard, Late..."
//                 />
//               </div>

//               {/* Điều chỉnh giá */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">Điều chỉnh giá</label>
//                 <div className="flex items-end gap-3">
//                   <div className="w-24">
//                     <input
//                       type="number"
//                       min="0"
//                       max="100"
//                       value={percentValue}
//                       onChange={(e) => setPercentValue(Number(e.target.value))}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="0"
//                     />
//                   </div>
//                   <div className="flex gap-3">
//                     <label className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="radio"
//                         name="percentType"
//                         value="increase"
//                         checked={percentType === "increase"}
//                         onChange={() => setPercentType("increase")}
//                         className="w-4 h-4"
//                       />
//                       <span className="text-sm text-red-600 font-medium">Tăng</span>
//                     </label>
//                     <label className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="radio"
//                         name="percentType"
//                         value="decrease"
//                         checked={percentType === "decrease"}
//                         onChange={() => setPercentType("decrease")}
//                         className="w-4 h-4"
//                       />
//                       <span className="text-sm text-green-600 font-medium">Giảm</span>
//                     </label>
//                   </div>
//                   {currentEditingPrice && percentValue > 0 && (
//                     <div className="text-sm bg-gray-50 p-2 rounded">
//                       <strong
//                         className={
//                           percentType === "increase"
//                             ? "text-red-600"
//                             : "text-green-600"
//                         }
//                       >
//                         {calculatedPrice.toLocaleString()} VND
//                       </strong>
//                       {" "}(
//                       {percentType === "increase" ? "+" : "-"}
//                       {percentValue}%)
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Grid thời gian và slot */}
//               <div className="grid grid-cols-4 gap-3">
//                 <div>
//                   <label className="text-sm font-medium text-gray-700 block mb-1.5">
//                     Ngày bắt đầu
//                   </label>
//                   <input
//                     type="date"
//                     value={tempPhase.startDate ? new Date(tempPhase.startDate).toISOString().split('T')[0] : ''}
//                     onChange={(e) => {
//                       const selectedDate = e.target.value;
//                       const isoDateTime = new Date(selectedDate + 'T00:00:00').toISOString();
//                       handleUpdateTempPhase('startDate', isoDateTime);
//                     }}
//                     min={waitlistPhase?.registrationStartDate ? new Date(waitlistPhase.registrationStartDate).toISOString().split('T')[0] : ''}
//                     max={waitlistPhase?.registrationEndDate ? new Date(waitlistPhase.registrationEndDate).toISOString().split('T')[0] : ''}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 block mb-1.5">
//                     Số ngày
//                   </label>
//                   <input
//                     type="number"
//                     min="1"
//                     max={maxDuration}
//                     value={durationInDays}
//                     onChange={(e) => {
//                       const numVal = Number(e.target.value);
//                       if (numVal > maxDuration) return;
//                       setDurationInDays(numVal);
//                     }}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                     Ngày kết thúc
//                   </label>
//                   <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex items-center h-[42px]">
//                     {tempPhase.startDate && durationInDays > 0 ? (
//                       <span className="text-gray-900">
//                         {new Date(calculateEndDate(tempPhase.startDate, durationInDays)).toLocaleDateString("vi-VN")}
//                       </span>
//                     ) : (
//                       <span className="text-gray-400">--/--/----</span>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 block mb-1.5">
//                     Số slot (Tối đa: {currentEditingPrice ? authorPricesWithSlots.find(p => p.conferencePriceId === currentEditingPrice)?.availableSlot : 0})
//                   </label>
//                   <input
//                     type="number"
//                     value={tempPhase.totalslot}
//                     onChange={(e) => handleUpdateTempPhase('totalslot', parseInt(e.target.value) || 0)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     min="0"
//                     max={currentEditingPrice ? authorPricesWithSlots.find(p => p.conferencePriceId === currentEditingPrice)?.availableSlot : undefined}
//                   />
//                 </div>
//               </div>

//               {/* Refund Policies */}
//               <div className="border-t border-gray-200 pt-3">
//                 <div className="flex justify-between items-center mb-3">
//                   <h4 className="font-medium text-sm text-red-600">
//                     Chính sách hoàn tiền
//                   </h4>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={handleAddTempRefundPolicy}
//                     className="text-xs h-7"
//                   >
//                     + Thêm mức hoàn
//                   </Button>
//                 </div>

//                 <div className="space-y-2">
//                   {(tempPhase.refundInPhase || []).map((refund, refundIndex) => {
//                     const minRefundDate = calculateMinRefundDate(tempPhase.startDate);
//                     const maxRefundDate = waitlistPhase?.registrationEndDate
//                       ? new Date(waitlistPhase.registrationEndDate).toISOString().split('T')[0]
//                       : '';

//                     return (
//                       <div key={refundIndex} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-end">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {refundIndex === 0 ? "Tỷ lệ hoàn (%)" : ""}
//                           </label>
//                           <input
//                             type="number"
//                             min="0"
//                             max="100"
//                             value={refund.percentRefund}
//                             onChange={(e) =>
//                               handleUpdateTempRefundPolicy(refundIndex, 'percentRefund', Number(e.target.value))
//                             }
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {refundIndex === 0 ? (
//                               <span className="flex items-center gap-1">
//                                 Hạn hoàn tiền
//                                 <span className="text-xs text-blue-600 font-normal">
//                                   (≤ Registration End)
//                                 </span>
//                               </span>
//                             ) : ""}
//                           </label>
//                           <input
//                             type="date"
//                             value={refund.refundDeadline ? new Date(refund.refundDeadline).toISOString().split('T')[0] : ''}
//                             onChange={(e) => {
//                               const selectedDate = e.target.value;
//                               const isoDateTime = new Date(selectedDate + 'T23:59:59').toISOString();
//                               handleUpdateTempRefundPolicy(refundIndex, 'refundDeadline', isoDateTime);
//                             }}
//                             min={minRefundDate}
//                             max={maxRefundDate}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           />
//                         </div>
//                         {(tempPhase.refundInPhase || []).length > 1 && (
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             onClick={() => handleRemoveTempRefundPolicy(refundIndex)}
//                             className="h-[42px] w-[42px] p-0 flex items-center justify-center text-sm"
//                             title="Xoá mức hoàn"
//                           >
//                             ✕
//                           </Button>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           )}

//           <DialogFooter className="gap-2">
//             <DialogClose asChild>
//               <Button variant="outline">Hủy</Button>
//             </DialogClose>
//             <Button onClick={handleSavePhase} className="bg-blue-600 hover:bg-blue-700">
//               {currentEditingPhaseIndex === null ? "Thêm" : "Lưu"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }