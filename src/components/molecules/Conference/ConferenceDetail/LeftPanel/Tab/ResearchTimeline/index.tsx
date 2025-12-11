// components/pages/ConferenceDetailPointPage/Tab/ResearchTimelineTab.tsx
"use client";

import {
  Info,
  Clock,
  UserCheck,
  FileText,
  MessageCircle,
  Edit3,
  PackageCheck,
  Workflow,
} from "lucide-react";
import { useGetResearchConferenceDetailInternalQuery } from "@/redux/services/conference.service";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ConferencePriceResponse,
  ResearchConferencePhaseResponse,
  ResearchPhase,
  Phase,
} from "@/types/conference.type";
import { formatCurrency, formatDate as formatHelperDate } from "@/helper/format";
import {
  useCreateNextPhaseMutation,
  useAddPricePhaseForNextResearchPhaseMutation,
  useActivateNextPhaseMutation,
} from "@/redux/services/conferenceStep.service";
import { CreatePhaseForm } from "./CreatePhaseForm";
import { CreatePricePhaseForm } from "./CreatePricePhaseForm";
import { ActivatePhaseConfirm } from "./ActivatePhaseConfirm";

interface ResearchTimelineTabProps {
  conferenceId: string;
}

export function ResearchTimelineTab({ conferenceId }: ResearchTimelineTabProps) {
  const { data, isLoading, error, refetch } =
    useGetResearchConferenceDetailInternalQuery(conferenceId);
  const researchPrice = data?.data?.conferencePrices as ConferencePriceResponse[] || [];
  const researchPhases = [...(data?.data?.researchPhase || [])].sort(
    (a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0)
  );

  const [isCreatePhaseModalOpen, setIsCreatePhaseModalOpen] = useState(false);
  const [isCreatePricePhaseModalOpen, setIsCreatePricePhaseModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);

  const authorPrices = researchPrice.filter((price) => price.isAuthor);
  const authorPricesWithSlots = authorPrices.filter(
    (price) => (price.availableSlot ?? 0) > 0
  );

  // ✅ Phase đang active (dùng để xác định phase tiếp theo cần activate)
  const lastActivePhase = useMemo(() => {
    return researchPhases.find((p) => p.isActive);
  }, [researchPhases]);

  // ✅ Phase tiếp theo để activate (sau phase đang active)
  const nextPhaseToActivate = useMemo(() => {
    const expectedOrder = (lastActivePhase?.phaseOrder || 0) + 1;
    return researchPhases.find((p) => p.phaseOrder === expectedOrder && !p.isActive);
  }, [researchPhases, lastActivePhase]);

  // ✅ Phase order lớn nhất → dùng để tạo phase mới
  const maxPhaseOrder = useMemo(() => {
    return Math.max(...researchPhases.map((p) => p.phaseOrder || 0), 0);
  }, [researchPhases]);

  const nextPhaseOrderForCreation = maxPhaseOrder + 1;

  // ✅ Kiểm tra thiếu price phase cho phase cần activate
  const hasMissingAuthorPricePhases = useMemo(() => {
    if (!nextPhaseToActivate) return false;
    return authorPrices.some((price) => {
      const hasValidPhase = price.pricePhases?.some(
        (pp) =>
          pp.startDate === nextPhaseToActivate.authorPaymentStart &&
          pp.endDate === nextPhaseToActivate.authorPaymentEnd
      );
      return !hasValidPhase;
    });
  }, [nextPhaseToActivate, authorPrices]);

  const [createNextPhase, { isLoading: isCreatingPhase }] = useCreateNextPhaseMutation();
  const [addPricePhaseForNextResearchPhase, { isLoading: isAddingPrice }] =
    useAddPricePhaseForNextResearchPhaseMutation();
  const [activateNextPhase, { isLoading: isActivating }] = useActivateNextPhaseMutation();

  // === 1. Tạo phase mới (luôn là max + 1) ===
  const handleCreatePhase = async ({
    newPhase,
    authorConferencePriceIds,
  }: {
    newPhase: ResearchPhase;
    authorConferencePriceIds: string[];
  }) => {
    try {
      const {
        registrationDuration,
        fullPaperDuration,
        reviewDuration,
        reviseDuration,
        cameraReadyDuration,
        abstractDecideStatusDuration,
        fullPaperDecideStatusDuration,
        revisionPaperDecideStatusDuration,
        cameraReadyDecideStatusDuration,
        authorPaymentDuration,
        ...phaseForApi
      } = newPhase;

      await createNextPhase({
        conferenceId,
        newPhase: phaseForApi,
        authorConferencePriceIds,
      }).unwrap();

      toast.success(`Đã tạo Phase ${newPhase.phaseOrder} thành công!`);
      setIsCreatePhaseModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Tạo phase thất bại");
    }
  };

  // === 2. Tạo price phase cho phase cần activate ===
  const handleCreatePricePhase = async (payload: {
    conferencePriceId: string;
    phases: Phase[];
  }[]) => {
    try {
      for (const item of payload) {
        await addPricePhaseForNextResearchPhase(item).unwrap();
      }
      toast.success("Đã tạo Price Phase thành công!");
      setIsCreatePricePhaseModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Tạo Price Phase thất bại");
    }
  };

  // === 3. Kích hoạt phase tiếp theo sau phase đang active ===
  const handleActivate = async () => {
    try {
      await activateNextPhase(conferenceId).unwrap();
      toast.success(`Đã kích hoạt Phase ${(lastActivePhase?.phaseOrder || 0) + 1}!`);
      setIsActivateModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Kích hoạt phase thất bại");
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    return formatHelperDate(dateStr);
  };

  const formatRange = (start: string, end: string): string => {
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

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
    {
      title: "Tác giả thanh toán chi phí",
      start: phase.authorPaymentStart,
      end: phase.authorPaymentEnd,
      icon: PackageCheck,
      color: "text-teal-600",
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Timeline Nghiên cứu</h3>
        </div>

        {lastActivePhase && (
          <div className="flex flex-wrap gap-2">
            {/* ✅ LUÔN HIỂN THỊ: Tạo Phase mới (max + 1) */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreatePhaseModalOpen(true)}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              Tạo Phase {nextPhaseOrderForCreation}
            </Button>

            {/* Các nút liên quan đến activate (dựa trên phase active hiện tại) */}
            {nextPhaseToActivate && (
              <>
                {hasMissingAuthorPricePhases && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCreatePricePhaseModalOpen(true)}
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    Tạo Price Phase cho Phase {nextPhaseToActivate.phaseOrder}
                  </Button>
                )}
                {!hasMissingAuthorPricePhases && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsActivateModalOpen(true)}
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    Kích hoạt Phase {nextPhaseToActivate.phaseOrder}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Render each Phase */}
      {researchPhases.map((phase) => (
        <div
          key={phase.researchConferencePhaseId}
          className="bg-white border border-gray-200 rounded-lg p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <Workflow className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Phase {phase.phaseOrder || 1}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  phase.isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {phase.isActive ? "Đang hoạt động" : "Dừng hoạt động"}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100">
            {getTimelineSteps(phase).map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`mt-0.5 p-1 rounded-full ${item.color
                      .replace("text", "bg")
                      .replace("-600", "-100")}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{item.title}</span>
                      <span className="text-xs text-gray-500">
                        {formatRange(item.start ?? "", item.end ?? "")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal 1: Tạo Phase mới */}
      <Dialog open={isCreatePhaseModalOpen} onOpenChange={setIsCreatePhaseModalOpen}>
      <DialogContent 
        className="max-w-7xl max-h-[90vh] overflow-y-auto"
        style={{ width: '70vw', maxWidth: '1400px' }}
      >          
        <DialogHeader>
            <DialogTitle>Tạo Phase {nextPhaseOrderForCreation}</DialogTitle>
          </DialogHeader>
          <CreatePhaseForm
            lastPhase={lastActivePhase!}
            authorPrices={authorPricesWithSlots}
            conferenceStartDate={data?.data?.startDate || ""}
            revisionAttemptAllowed={data?.data?.revisionAttemptAllowed || 2}
            onSubmit={handleCreatePhase}
          />
          <DialogClose asChild>
            <Button variant="outline" disabled={isCreatingPhase}>
              Đóng
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Tạo Price Phase */}
      <Dialog
        open={isCreatePricePhaseModalOpen}
        onOpenChange={setIsCreatePricePhaseModalOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Tạo Price Phase cho Phase {nextPhaseToActivate?.phaseOrder}
            </DialogTitle>
          </DialogHeader>
          {nextPhaseToActivate && (
            <CreatePricePhaseForm
              nextPhase={nextPhaseToActivate}
              authorPrices={authorPrices}
              onSubmit={handleCreatePricePhase}
            />
          )}
          <DialogClose asChild>
            <Button variant="outline" disabled={isAddingPrice}>
              Đóng
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Kích hoạt Phase */}
      <Dialog open={isActivateModalOpen} onOpenChange={setIsActivateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Kích hoạt Phase {nextPhaseToActivate?.phaseOrder}
            </DialogTitle>
          </DialogHeader>
          {nextPhaseToActivate && (
            <ActivatePhaseConfirm
              phase={nextPhaseToActivate}
              currentActivePhase={lastActivePhase!}
              authorPrices={authorPrices}
              onConfirm={handleActivate}
            />
          )}
          <DialogClose asChild>
            <Button variant="outline" disabled={isActivating}>
              Đóng
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}