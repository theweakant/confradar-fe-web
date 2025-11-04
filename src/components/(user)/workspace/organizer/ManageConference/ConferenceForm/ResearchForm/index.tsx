import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  useCreateBasicResearchConferenceMutation,
  useUpdateBasicConferenceMutation,
  useCreateResearchDetailMutation,
  useCreateResearchPhaseMutation,
  useCreateConferencePriceMutation,
  useUpdateConferencePriceMutation,
  useCreateResearchSessionsMutation,
  useUpdateConferenceSessionMutation,
  useCreateConferencePoliciesMutation,
  useCreateRefundPoliciesMutation,
  useUpdateConferencePolicyMutation,
  useCreateResearchMaterialMutation,
  useCreateResearchRankingFileMutation,
  useCreateResearchRankingReferenceMutation,
  useCreateConferenceMediaMutation,
  useUpdateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,
  useUpdateConferenceSponsorMutation,
} from "@/redux/services/conferenceStep.service";

import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service";
import { useGetAllRankingCategoriesQuery } from "@/redux/services/category.service";


import {
  nextStep,
  prevStep,
  goToStep,
  setConferenceId,
  setMode,
  resetWizard,
  setMaxStep
} from "@/redux/slices/conferenceStep.slice";

import type {
  ConferenceBasicForm,
  ResearchDetail,
  ResearchPhase,
  RevisionRoundDeadline,
  Session,
  Policy,
  RefundPolicy,
  ResearchMaterial,
  ResearchRankingFile,
  ResearchRankingReference,
  Media,
  Sponsor,
  Conference,
  RoomInfoResponse,
  Ticket,
  Phase,
  ConferencePriceData,
} from "@/types/conference.type";
import { toast } from "sonner";

const RESEARCH_STEPS = [
  { id: 1, title: "Thông tin cơ bản" },
  { id: 2, title: "Chi tiết nghiên cứu" },
  { id: 3, title: "Giá vé" },
  { id: 4, title: "Timeline & Giai đoạn" },
  { id: 5, title: "Phiên họp" },
  { id: 6, title: "Chính sách" },
  { id: 7, title: "Tài liệu & Xếp hạng" },
  { id: 8, title: "Media" },
  { id: 9, title: "Nhà tài trợ" },
];

interface ResearchConferenceStepFormProps {
  conference?: Conference | null;
  onSave?: (data: Conference) => void;
  onCancel?: () => void;
}

export function ResearchConferenceStepForm({
  conference,
  onSave,
  onCancel,
}: ResearchConferenceStepFormProps) {
  const dispatch = useAppDispatch();
  const { currentStep, conferenceId: reduxConferenceId, mode: reduxMode, maxStep  } = useAppSelector(
    (state) => state.conferenceStep
  );

  const isEditMode = reduxMode === 'edit' || !!conference;
  const conferenceId = isEditMode ? conference?.conferenceId : reduxConferenceId;

  // API Mutations - CREATE
  const [createBasicResearch] = useCreateBasicResearchConferenceMutation();
  const [createResearchDetail] = useCreateResearchDetailMutation();
  const [createPrice] = useCreateConferencePriceMutation(); 
  const [createResearchPhase] = useCreateResearchPhaseMutation();
  const [createSessions] = useCreateResearchSessionsMutation();
  const [createPolicies] = useCreateConferencePoliciesMutation();
  const [createRefundPolicies] = useCreateRefundPoliciesMutation();
  const [createResearchMaterial] = useCreateResearchMaterialMutation();
  const [createResearchRankingFile] = useCreateResearchRankingFileMutation();
  const [createResearchRankingReference] = useCreateResearchRankingReferenceMutation();
  const [createMedia] = useCreateConferenceMediaMutation();
  const [createSponsors] = useCreateConferenceSponsorsMutation();

  // API Mutations - UPDATE (TODO: thêm sau)
  const [updateBasic] = useUpdateBasicConferenceMutation();
  const [updatePrice] = useUpdateConferencePriceMutation(); 
  const [updateSession] = useUpdateConferenceSessionMutation();
  const [updatePolicy] = useUpdateConferencePolicyMutation();
  const [updateMedia] = useUpdateConferenceMediaMutation();
  const [updateSponsor] = useUpdateConferenceSponsorMutation();

  // Query hooks
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } = useGetAllCitiesQuery();
  const { data: rankingData, isLoading: isisRankingLoading } = useGetAllRankingCategoriesQuery();

  const categoryOptions =
    categoriesData?.data?.map((category) => ({
      value: category.conferenceCategoryId,
      label: category.conferenceCategoryName,
    })) || [];

  const roomOptions =
    roomsData?.data?.map((room) => ({
      value: room.roomId,
      label: `${room.number} - ${room.displayName} - ${room.destinationId}`,
    })) || [];

  const cityOptions =
    citiesData?.data?.map((city) => ({
      value: city.cityId,
      label: city.cityName || "N/A",
    })) || [];

  const rankingOptions =
    rankingData?.data?.map((ranking) => ({
      value: ranking.rankId,
      label: ranking.rankName || "N/A",
    })) || [];

  // ============================================
  // LOADING STATES
  // ============================================
  const [stepLoadings, setStepLoadings] = useState({
    basic: false,
    researchDetail: false,
    prices: false,
    researchPhase: false,
    sessions: false,
    policies: false,
    refundPolicies: false,
    materials: false,
    media: false,
    sponsors: false,
  });

  //1: BASIC INFO 
  const [basicForm, setBasicForm] = useState<ConferenceBasicForm>({
    conferenceName: "",
    description: "",
    startDate: "",
    endDate: "",
    totalSlot: 0,
    address: "",
    bannerImageFile: null,
    isInternalHosted: true,
    isResearchConference: true, 
    conferenceCategoryId: "",
    cityId: "",
    ticketSaleStart: "",
    ticketSaleEnd: "",
    createdby: "",
  });
  const [existingBannerUrl, setExistingBannerUrl] = useState<string>("");

  //2: RESEARCH DETAILS
  const [researchDetail, setResearchDetail] = useState<ResearchDetail>({
    name: "",
    paperFormat: "",
    numberPaperAccept: 0,
    revisionAttemptAllowed: 0,
    rankingDescription: "",
    allowListener: false,
    rankValue: "",
    rankYear: 0,
    reviewFee: 0,
    rankingCategoryId: "",
  });

  //3: PRICE
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState<Ticket>({
    ticketPrice: 0,
    ticketName: "",
    ticketDescription: "",
    isAuthor: false,
    totalSlot: 0,
  });

  const [phases, setPhases] = useState<Phase[]>([]);
  const [newPhase, setNewPhase] = useState<Phase>({
    phaseName: "",
    applyPercent: 0,
    startDate: "",
    endDate: "",
    totalslot: 0,
  });

  //4: RESEARCH PHASE
  const [researchPhase, setResearchPhase] = useState<ResearchPhase>({
    registrationStartDate: "",
    registrationEndDate: "",
    fullPaperStartDate: "",
    fullPaperEndDate: "",
    reviewStartDate: "",
    reviewEndDate: "",
    reviseStartDate: "",
    reviseEndDate: "",
    cameraReadyStartDate: "",
    cameraReadyEndDate: "",
    isWaitlist: false,
    isActive: true,
    revisionRoundDeadlines: [],
  });

  const [revisionRoundDeadlines, setRevisionRoundDeadlines] = useState<RevisionRoundDeadline[]>([]);
  const [newRevisionRound, setNewRevisionRound] = useState<RevisionRoundDeadline>({
    endDate: "",
    roundNumber: 0,
  });

  //5: SESSIONS
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newSession, setNewSession] = useState<Session>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    date: "",
    roomId: "",
    sessionMedias: [],
  });

  //6: POLICIES 
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [newPolicy, setNewPolicy] = useState<Policy>({
    policyName: "",
    description: "",
  });

  const [refundPolicies, setRefundPolicies] = useState<RefundPolicy[]>([]);
  const [newRefundPolicy, setNewRefundPolicy] = useState<RefundPolicy>({
    percentRefund: 100,
    refundDeadline: "",
    refundOrder: 0,
  });

  //7: MATERIALS & RANKINGS
  const [researchMaterials, setResearchMaterials] = useState<ResearchMaterial[]>([]);
  const [newMaterial, setNewMaterial] = useState<ResearchMaterial>({
    fileName: "",
    fileDescription: "",
    file: null,
  });

  const [rankingFiles, setRankingFiles] = useState<ResearchRankingFile[]>([]);
  const [newRankingFile, setNewRankingFile] = useState<ResearchRankingFile>({
    fileUrl: "",
    file: null,
  });

  const [rankingReferences, setRankingReferences] = useState<ResearchRankingReference[]>([]);
  const [newRankingReference, setNewRankingReference] = useState<ResearchRankingReference>({
    referenceUrl: "",
  });

  //8: MEDIA 
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [newMedia, setNewMedia] = useState<Media>({
    mediaFile: "",
  });

  //9: SPONSORS 
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [newSponsor, setNewSponsor] = useState<Sponsor>({
    name: "",
    imageFile: "",
  });

  // ============================================
  // LOAD DATA IN EDIT MODE
  // ============================================
  useEffect(() => {
      dispatch(setMaxStep(9));

    if (isEditMode && conference) {
      dispatch(setMode('edit'));
      dispatch(setConferenceId(conference.conferenceId));
      loadConferenceData(conference);
    } else {
      dispatch(setMode('create'));
    }
  }, [isEditMode, conference, dispatch]);

  const loadConferenceData = (conf: Conference) => {
    // Step 1: Basic Info
    setBasicForm({
      conferenceName: conf.conferenceName || "",
      description: conf.description || "",
      startDate: conf.startDate ? conf.startDate.split("T")[0] : "",
      endDate: conf.endDate ? conf.endDate.split("T")[0] : "",
      totalSlot: conf.totalSlot || 0,
      address: conf.address || "",
      bannerImageFile: null,
      isInternalHosted: conf.isInternalHosted ?? true,
      isResearchConference: true,
      conferenceCategoryId: conf.conferenceCategoryId || "",
      cityId: conf.cityId || "",
      ticketSaleStart: conf.ticketSaleStart ? conf.ticketSaleStart.split("T")[0] : "",
      ticketSaleEnd: conf.ticketSaleEnd ? conf.ticketSaleEnd.split("T")[0] : "",
      createdby: conf.createdby || "",
    });
    setExistingBannerUrl(conf.bannerImageUrl || "");

    // Step 2: Research Details
    if (conf.researchDetail) {
      setResearchDetail(conf.researchDetail);
    }

    //Step 3: PRICE
    if (conf.tickets && conf.tickets.length > 0) {
      const transformedTickets: Ticket[] = conf.tickets.map((t) => ({
        ticketId: t.ticketId,
        ticketPrice: t.ticketPrice ?? 0,
        ticketName: t.ticketName ?? "",
        ticketDescription: t.ticketDescription ?? "",
        isAuthor: t.isAuthor ?? false,
        totalSlot: t.totalSlot ?? 0,
      }));
      setTickets(transformedTickets);
    }    

    if (conf.phases && conf.phases.length > 0) {
      const transformedPhases: Phase[] = conf.phases.map((p) => ({
        pricePhaseId: p.pricePhaseId,
        phaseName: p.phaseName ?? "",
        applyPercent: p.applyPercent ?? 0,
        startDate: p.startDate ? p.startDate.split("T")[0] : "",
        endDate: p.endDate ? p.endDate.split("T")[0] : "",
        totalslot: p.totalslot ?? 0,
      }));
      setPhases(transformedPhases);
    }    

    // Step 4: Research Phases
    if (conf.researchPhase) {
      setResearchPhase({
        ...conf.researchPhase,
        registrationStartDate: conf.researchPhase.registrationStartDate?.split("T")[0] || "",
        registrationEndDate: conf.researchPhase.registrationEndDate?.split("T")[0] || "",
        fullPaperStartDate: conf.researchPhase.fullPaperStartDate?.split("T")[0] || "",
        fullPaperEndDate: conf.researchPhase.fullPaperEndDate?.split("T")[0] || "",
        reviewStartDate: conf.researchPhase.reviewStartDate?.split("T")[0] || "",
        reviewEndDate: conf.researchPhase.reviewEndDate?.split("T")[0] || "",
        reviseStartDate: conf.researchPhase.reviseStartDate?.split("T")[0] || "",
        reviseEndDate: conf.researchPhase.reviseEndDate?.split("T")[0] || "",
        cameraReadyStartDate: conf.researchPhase.cameraReadyStartDate?.split("T")[0] || "",
        cameraReadyEndDate: conf.researchPhase.cameraReadyEndDate?.split("T")[0] || "",
      });
      setRevisionRoundDeadlines(conf.researchPhase.revisionRoundDeadlines || []);
    }

    // Step 5: Sessions
    if (conf.sessions) {
      setSessions(conf.sessions.map(s => ({
        sessionId: s.sessionId,
        title: s.title || "",
        description: s.description || "",
        startTime: s.startTime ? s.startTime.slice(0, 16) : "",
        endTime: s.endTime ? s.endTime.slice(0, 16) : "",
        date: s.date ? s.date.split("T")[0] : "",
        roomId: s.roomId || "",
        sessionMedias: s.sessionMedias || [],
      })));
    }

    // Step 6: Policies
    if (conf.policies) {
      setPolicies(conf.policies);
    }
    if (conf.refundPolicies) {
      setRefundPolicies(conf.refundPolicies);
    }

    // Step 7: Materials & Rankings
    if (conf.researchMaterials) {
      setResearchMaterials(conf.researchMaterials);
    }
    if (conf.researchRankingFiles) {
      setRankingFiles(conf.researchRankingFiles);
    }
    if (conf.researchRankingReferences) {
      setRankingReferences(conf.researchRankingReferences);
    }

    // Step 8: Media
    if (conf.media) {
      setMediaList(conf.media.map(m => ({
        mediaId: m.mediaId,
        mediaFile: m.mediaUrl || "",
      })));
    }

    // Step 9: Sponsors
    if (conf.sponsors) {
      setSponsors(conf.sponsors.map(s => ({
        sponsorId: s.sponsorId,
        name: s.name || "",
        imageFile: s.imageUrl || "",
      })));
    }
  };

  // ============================================
  // VALIDATION
  // ============================================
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!basicForm.conferenceName.trim()) {
          toast.error("Vui lòng nhập tên hội thảo!");
          return false;
        }
        if (!basicForm.startDate || !basicForm.endDate) {
          toast.error("Vui lòng chọn ngày bắt đầu và kết thúc!");
          return false;
        }
        return true;

      case 2:
        if (!researchDetail.name || !researchDetail.paperFormat) {
          toast.error("Vui lòng điền đầy đủ thông tin nghiên cứu!");
          return false;
        }
        return true;

      case 3:
        if (tickets.length === 0) {
          toast.error("Vui lòng thêm ít nhất 1 loại vé!");
          return false;
        }
        if (phases.length === 0) {
          toast.warning("Chưa có giai đoạn giá nào. Bạn có thể thêm sau.");
        }
        return true;

      case 4:
        if (!researchPhase.registrationStartDate || !researchPhase.fullPaperEndDate) {
          toast.error("Vui lòng điền đầy đủ timeline!");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // CREATE MODE HANDLERS
  const handleBasicSubmitCreate = async () => {
    try {
      setStepLoadings({ ...stepLoadings, basic: true });
      const result = await createBasicResearch(basicForm).unwrap();
      const confId = result.data.conferenceId;
      dispatch(setConferenceId(confId));
      toast.success("Tạo thông tin cơ bản thành công!");
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create basic info:", error);
      toast.error("Tạo mới thất bại!");
    } finally {
      setStepLoadings({ ...stepLoadings, basic: false });
    }
  };

  const handleResearchDetailSubmitCreate = async () => {
    if (!conferenceId) return;
    try {
      setStepLoadings({ ...stepLoadings, researchDetail: true });
      await createResearchDetail({ conferenceId, data: researchDetail }).unwrap();
      toast.success("Tạo chi tiết nghiên cứu thành công!");
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create research detail:", error);
      toast.error("Tạo chi tiết nghiên cứu thất bại!");
    } finally {
      setStepLoadings({ ...stepLoadings, researchDetail: false });
    }
  };

  const handlePriceSubmitCreate = async () => {
    if (!conferenceId) return;
    
    if (tickets.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 loại vé!");
      return;
    }

    try {
      setStepLoadings({ ...stepLoadings, prices: true });
      
      const promises = tickets.map(ticket => {
        const data: ConferencePriceData = { 
          typeOfTicket: ticket,
          phases
        };
        return createPrice({ conferenceId, data }).unwrap();
      });

      await Promise.all(promises);
      toast.success(`Tạo thành công ${tickets.length} loại vé!`);
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create price:", error);
      toast.error("Tạo giá vé thất bại!");
    } finally {
      setStepLoadings({ ...stepLoadings, prices: false });
    }
  };  

  const handleResearchPhaseSubmitCreate = async () => {
    if (!conferenceId) return;
    try {
      setStepLoadings({ ...stepLoadings, researchPhase: true });
      const data = { ...researchPhase, revisionRoundDeadlines };
      await createResearchPhase({ conferenceId, data }).unwrap();
      toast.success("Tạo timeline thành công!");
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create research phase:", error);
      toast.error("Tạo timeline thất bại!");
    } finally {
      setStepLoadings({ ...stepLoadings, researchPhase: false });
    }
  };

  const handleSessionSubmitCreate = async () => {
    if (!conferenceId) return;
    try {
      setStepLoadings({ ...stepLoadings, sessions: true });
      const formattedSessions = sessions.map((s) => ({
        title: s.title,
        description: s.description,
        date: s.date,
        startTime: new Date(s.startTime).toISOString(),
        endTime: new Date(s.endTime).toISOString(),
        roomId: s.roomId,
        sessionMedias: s.sessionMedias || [],
      }));

      const data = { sessions: formattedSessions };
      await createSessions({ conferenceId, data }).unwrap();
      toast.success("Tạo phiên họp thành công!");
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create sessions:", error);
      toast.error("Tạo phiên họp thất bại!");
    } finally {
      setStepLoadings({ ...stepLoadings, sessions: false });
    }
  };

  const handlePoliciesSubmitCreate = async () => {
    if (!conferenceId) return;
    try {
      setStepLoadings({ ...stepLoadings, policies: true });
      
      // Create Terms & Conditions
      if (policies.length > 0) {
        await createPolicies({ conferenceId, data: { policies } }).unwrap();
      }
      
      // Create Refund Policies
      if (refundPolicies.length > 0) {
        await createRefundPolicies({ conferenceId, data: { refundPolicies } }).unwrap();
      }
      
      toast.success("Tạo chính sách thành công!");
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create policies:", error);
      toast.error("Tạo chính sách thất bại!");
    } finally {
      setStepLoadings({ ...stepLoadings, policies: false });
    }
  };

  const handleMaterialsAndRankingsSubmitCreate = async () => {
    if (!conferenceId) return;
    try {
      setStepLoadings({ ...stepLoadings, materials: true });
      
      const promises = [];
      
      // Create Materials
      for (const material of researchMaterials) {
        promises.push(
          createResearchMaterial({
            conferenceId,
            fileName: material.fileName,
            fileDescription: material.fileDescription,
            file: material.file || undefined,
          }).unwrap()
        );
      }
      
      // Create Ranking Files
      // for (const file of rankingFiles) {
      //   promises.push(
      //     createResearchRankingFile({
      //       conferenceId,
      //       fileUrl: file.fileUrl,
      //       file: file.file || undefined,
      //     }).unwrap()
      //   );
      // }
      for (const file of rankingFiles) {
      if (file.fileUrl) { // ⭐ Only create if fileUrl exists
        promises.push(
          createResearchRankingFile({
            conferenceId,
            fileUrl: file.fileUrl,
            file: file.file || undefined,
          }).unwrap()
        );
      }
    }
      
      // Create Ranking References
      for (const ref of rankingReferences) {
        promises.push(
          createResearchRankingReference({
            conferenceId,
            referenceUrl: ref.referenceUrl,
          }).unwrap()
        );
      }
      
      await Promise.all(promises);
      toast.success("Tạo tài liệu & xếp hạng thành công!");
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create materials/rankings:", error);
      toast.error("Tạo tài liệu thất bại!");
    } finally {
      setStepLoadings({ ...stepLoadings, materials: false });
    }
  };

  const handleMediaSubmitCreate = async () => {
    if (!conferenceId) return;
    try {
      setStepLoadings({ ...stepLoadings, media: true });
      const data = { media: mediaList };
      await createMedia({ conferenceId, data }).unwrap();
      toast.success("Tạo media thành công!");
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create media:", error);
      toast.error("Tạo media thất bại!");
    } finally {
      setStepLoadings({ ...stepLoadings, media: false });
    }
  };

  const handleSponsorSubmitCreate = async () => {
    if (!conferenceId) return;
    try {
      setStepLoadings({ ...stepLoadings, sponsors: true });
      const data = { sponsors };
      await createSponsors({ conferenceId, data }).unwrap();
      toast.success("Tạo hội thảo nghiên cứu thành công!");
      dispatch(resetWizard());
      if (onCancel) onCancel();
    } catch (error) {
      console.error("Failed to create sponsors:", error);
      toast.error("Tạo nhà tài trợ thất bại!");
    } finally {
      setStepLoadings({ ...stepLoadings, sponsors: false });
    }
  };

  // ============================================
  // EDIT MODE - TODO: Implement later
  // ============================================
  const handleSaveAllChanges = async () => {
    toast.info("Chức năng cập nhật đang được phát triển!");
    // TODO: Implement update logic similar to TechForm
  };

  // ============================================
  // ADD HANDLERS
  // ============================================

const handleAddTicket = () => {
  if (!newTicket.ticketName || !newTicket.ticketPrice) return;
  setTickets([...tickets, newTicket]);
  setNewTicket({
    ticketPrice: 0,
    ticketName: "",
    ticketDescription: "",
    isAuthor: false,
    totalSlot: 0,
  });
};

const handleAddPhase = () => {
  if (!newPhase.phaseName || !newPhase.startDate || !newPhase.endDate) return;
  setPhases([...phases, newPhase]);
  setNewPhase({
    phaseName: "",
    applyPercent: 0,
    startDate: "",
    endDate: "",
    totalslot: 0,
  });
};

  const handleAddSession = () => {
    if (!newSession.title) return;
    setSessions([...sessions, newSession]);
    setNewSession({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      roomId: "",
      sessionMedias: [],
    });
  };

  const handleAddPolicy = () => {
    if (!newPolicy.policyName) return;
    setPolicies([...policies, newPolicy]);
    setNewPolicy({ policyName: "", description: "" });
  };

  const handleAddRefundPolicy = () => {
    if (!newRefundPolicy.refundDeadline) return;
    setRefundPolicies([...refundPolicies, newRefundPolicy]);
    setNewRefundPolicy({ percentRefund: 100, refundDeadline: "", refundOrder: 0 });
  };

  const handleAddRevisionRound = () => {
    if (!newRevisionRound.endDate) return;
    setRevisionRoundDeadlines([...revisionRoundDeadlines, newRevisionRound]);
    setNewRevisionRound({ endDate: "", roundNumber: 0 });
  };

  const handleAddMaterial = () => {
    if (!newMaterial.fileName) return;
    setResearchMaterials([...researchMaterials, newMaterial]);
    setNewMaterial({ fileName: "", fileDescription: "", file: null });
  };

  const handleAddRankingFile = () => {
    if (!newRankingFile.fileUrl && !newRankingFile.file) return;
    setRankingFiles([...rankingFiles, newRankingFile]);
    setNewRankingFile({ fileUrl: "", file: null });
  };

  const handleAddRankingReference = () => {
    if (!newRankingReference.referenceUrl) return;
    setRankingReferences([...rankingReferences, newRankingReference]);
    setNewRankingReference({ referenceUrl: "" });
  };

  const handleAddMedia = () => {
    if (!newMedia.mediaFile) return;
    setMediaList([...mediaList, newMedia]);
    setNewMedia({ mediaFile: "" });
  };

  const handleAddSponsor = () => {
    if (!newSponsor.name) return;
    setSponsors([...sponsors, newSponsor]);
    setNewSponsor({ name: "", imageFile: "" });
  };



  const handleNext = () => {
  if (!validateStep(currentStep)) return;

  if (isEditMode) {
    if (currentStep === maxStep) {
      handleSaveAllChanges();
    } else {
      dispatch(nextStep());
    }
  } else {
    switch (currentStep) {
      case 1: handleBasicSubmitCreate(); break;
      case 2: handleResearchDetailSubmitCreate(); break;
      case 3: handlePriceSubmitCreate(); break;
      case 4: handleResearchPhaseSubmitCreate(); break;
      case 5: handleSessionSubmitCreate(); break;
      case 6: handlePoliciesSubmitCreate(); break;
      case 7: handleMaterialsAndRankingsSubmitCreate(); break;
      case 8: handleMediaSubmitCreate(); break;
      case 9: handleSponsorSubmitCreate(); break;
    }
  }
};

  const handleStepClick = (stepId: number) => {
    if (isEditMode) {
      dispatch(goToStep(stepId));
    }
  };

  // ============================================
  // RENDER STEP CONTENT
  // ============================================
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
      {stepLoadings.basic && (
        <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
          ⏳ Đang xử lý...
        </div>
      )}
      <FormInput
        label="Tên hội thảo"
        name="conferenceName"
        value={basicForm.conferenceName}
        onChange={(val) => setBasicForm({ ...basicForm, conferenceName: val })}
        required
      />
      <FormTextArea
        label="Mô tả"
        name="description"
        value={basicForm.description ?? ""}
        onChange={(val) => setBasicForm({ ...basicForm, description: val })}
        rows={3}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Ngày bắt đầu"
          name="startDate"
          type="date"
          value={basicForm.startDate}
          onChange={(val) => setBasicForm({ ...basicForm, startDate: val })}
          required
        />
        <FormInput
          label="Ngày kết thúc"
          name="endDate"
          type="date"
          value={basicForm.endDate}
          onChange={(val) => setBasicForm({ ...basicForm, endDate: val })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Ngày bắt đầu bán vé"
          name="ticketSaleStart"
          type="date"
          value={basicForm.ticketSaleStart}
          onChange={(val) => setBasicForm({ ...basicForm, ticketSaleStart: val })}
          required
        />
        <FormInput
          label="Ngày kết thúc bán vé"
          name="ticketSaleEnd"
          type="date"
          value={basicForm.ticketSaleEnd}
          onChange={(val) => setBasicForm({ ...basicForm, ticketSaleEnd: val })}
          required
        />
      </div>

      <FormInput
        label="Sức chứa"
        name="totalSlot"
        type="number"
        value={basicForm.totalSlot}
        onChange={(val) => setBasicForm({ ...basicForm, totalSlot: Number(val) })}
        required
      />

      <FormInput
        label="Địa chỉ"
        name="address"
        value={basicForm.address ?? ""}
        onChange={(val) => setBasicForm({ ...basicForm, address: val })}
      />

      <FormSelect
        label="Danh mục"
        name="categoryId"
        value={basicForm.conferenceCategoryId}
        onChange={(val) => setBasicForm({ ...basicForm, conferenceCategoryId: val })}
        options={categoryOptions}
        required
        disabled={isCategoriesLoading}
      />

      <FormSelect
        label="Thành phố"
        name="cityId"
        value={basicForm.cityId}
        onChange={(val) => setBasicForm({ ...basicForm, cityId: val })}
        options={cityOptions}
        required
        disabled={isCitiesLoading}
      />

      <FormInput
        label="Người tạo"
        name="createdby"
        value={basicForm.createdby ?? ""}
        onChange={(val) => setBasicForm({ ...basicForm, createdby: val })}
      />

      <div>
        <label className="block text-sm font-medium mb-2">Banner Image</label>
        {isEditMode && existingBannerUrl && !basicForm.bannerImageFile && (
          <div className="mb-2">
            <img
              src={existingBannerUrl}
              alt="Current banner"
              className="h-32 w-auto object-cover rounded border"
            />
            <p className="text-sm text-gray-500 mt-1">
              Banner hiện tại (upload file mới để thay đổi)
            </p>
          </div>
        )}
        <input
          type="file"
          onChange={(e) =>
            setBasicForm({
              ...basicForm,
              bannerImageFile: e.target.files?.[0] || null,
            })
          }
          accept="image/*"
        />
      </div>
    </div>
  );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chi tiết nghiên cứu</h3>
            {stepLoadings.researchDetail && (
              <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
                ⏳ Đang xử lý...
              </div>
            )}
            <FormInput
              label="Tên nghiên cứu"
              name="name"
              value={researchDetail.name}
              onChange={(val) => setResearchDetail({ ...researchDetail, name: val })}
              required
            />
            <FormInput
              label="Định dạng bài báo"
              name="paperFormat"
              value={researchDetail.paperFormat}
              onChange={(val) => setResearchDetail({ ...researchDetail, paperFormat: val })}
              required
              placeholder="VD: IEEE, ACM, Springer..."
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Số bài báo chấp nhận"
                name="numberPaperAccept"
                type="number"
                value={researchDetail.numberPaperAccept}
                onChange={(val) => setResearchDetail({ ...researchDetail, numberPaperAccept: Number(val) })}
              />
              <FormInput
                label="Số lần chỉnh sửa cho phép"
                name="revisionAttemptAllowed"
                type="number"
                value={researchDetail.revisionAttemptAllowed}
                onChange={(val) => setResearchDetail({ ...researchDetail, revisionAttemptAllowed: Number(val) })}
              />
            </div>

          <FormSelect
            label="Loại xếp hạng"
            name="rankingCategoryId"
            value={researchDetail.rankingCategoryId}
            onChange={(val) => {
              const selectedRank = rankingData?.data?.find((r) => r.rankId === val);
              setResearchDetail({
                ...researchDetail,
                rankingCategoryId: val,
                rankValue: selectedRank?.rankName || "",
              });
            }}
            options={rankingOptions}
            required
            disabled={isisRankingLoading}
          />

            <FormTextArea
              label="Mô tả xếp hạng"
              name="rankingDescription"
              value={researchDetail.rankingDescription}
              onChange={(val) => setResearchDetail({ ...researchDetail, rankingDescription: val })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Giá trị xếp hạng"
                name="rankValue"
                value={researchDetail.rankValue}
                onChange={(val) => setResearchDetail({ ...researchDetail, rankValue: val })}
                placeholder="VD: A*, A, B, C..."
              />
              <FormInput
                label="Năm xếp hạng"
                name="rankYear"
                type="number"
                value={researchDetail.rankYear}
                onChange={(val) => setResearchDetail({ ...researchDetail, rankYear: Number(val) })}
              />
            </div>
            <FormInput
              label="Phí đánh giá bài báo (VND)"
              name="reviewFee"
              type="number"
              value={researchDetail.reviewFee}
              onChange={(val) => setResearchDetail({ ...researchDetail, reviewFee: Number(val) })}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowListener"
                checked={researchDetail.allowListener}
                onChange={(e) => setResearchDetail({ ...researchDetail, allowListener: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="allowListener" className="text-sm font-medium">
                Cho phép người nghe tham dự
              </label>
            </div>
          </div>
        );

      case 3:
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Giá vé</h3>
          {stepLoadings.prices && (
            <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
              ⏳ Đang cập nhật giá vé...
            </div>
          )}

          {/* TICKETS SECTION */}
          <div className="border p-4 rounded">
            <h4 className="font-medium mb-3">Danh sách vé ({tickets.length})</h4>
            {tickets.map((t, idx) => (
              <div
                key={t.ticketId || idx}
                className="p-3 bg-gray-50 rounded mb-2 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{t.ticketName}</div>
                  <div className="text-sm text-gray-600">
                    {t.ticketPrice.toLocaleString()} VND
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.ticketDescription || "Không có mô tả"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Slot: {t.totalSlot} | Author: {t.isAuthor ? "Có" : "Không"}
                  </div>
                  {t.ticketId && (
                    <div className="text-xs text-blue-600">ID: {t.ticketId}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewTicket(t);
                      setTickets(tickets.filter((_, i) => i !== idx));
                    }}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setTickets(tickets.filter((_, i) => i !== idx))}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-4 space-y-3 border-t pt-3">
              <h5 className="font-medium">Thêm vé mới</h5>
              <FormInput
                label="Tên vé"
                name="ticketName"
                value={newTicket.ticketName}
                onChange={(val) => setNewTicket({ ...newTicket, ticketName: val })}
                required
              />
              <FormTextArea
                label="Mô tả vé"
                value={newTicket.ticketDescription}
                onChange={(val) => setNewTicket({ ...newTicket, ticketDescription: val })}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Giá vé (VND)"
                  name="ticketPrice"
                  type="number"
                  value={newTicket.ticketPrice}
                  onChange={(val) => setNewTicket({ ...newTicket, ticketPrice: Number(val) })}
                  required
                />
                <FormInput
                  label="Số lượng slot"
                  name="totalSlot"
                  type="number"
                  value={newTicket.totalSlot}
                  onChange={(val) => setNewTicket({ ...newTicket, totalSlot: Number(val) })}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAuthor"
                  checked={newTicket.isAuthor || false}
                  onChange={(e) => setNewTicket({ ...newTicket, isAuthor: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isAuthor" className="text-sm font-medium">
                  Vé dành cho tác giả
                </label>
              </div>
              <Button onClick={handleAddTicket}>Thêm vé</Button>
            </div>
          </div>

          {/* PHASES SECTION */}
          <div className="border p-4 rounded">
            <h4 className="font-medium mb-3">Giai đoạn giá ({phases.length})</h4>
            
            {phases.map((phase, idx) => (
              <div
                key={phase.pricePhaseId || idx}
                className="p-3 bg-gray-50 rounded mb-2 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{phase.phaseName}</div>
                  <div className="text-sm text-gray-600">
                    Giảm/Tăng: {phase.applyPercent}% | Slot: {phase.totalslot}
                  </div>
                  <div className="text-xs text-gray-500">
                    {phase.startDate} → {phase.endDate}
                  </div>
                  {phase.pricePhaseId && (
                    <div className="text-xs text-blue-600">ID: {phase.pricePhaseId}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewPhase(phase);
                      setPhases(phases.filter((_, i) => i !== idx));
                    }}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setPhases(phases.filter((_, i) => i !== idx))}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-4 space-y-3 border-t pt-3">
              <h5 className="font-medium">Thêm giai đoạn mới</h5>
              <FormInput
                label="Tên giai đoạn"
                name="phaseName"
                value={newPhase.phaseName}
                onChange={(val) => setNewPhase({ ...newPhase, phaseName: val })}
                required
                placeholder="VD: Early Bird, Standard, Late"
              />
              <FormInput
                label="% Giảm/Tăng giá"
                name="applyPercent"
                type="number"
                value={newPhase.applyPercent}
                onChange={(val) => setNewPhase({ ...newPhase, applyPercent: Number(val) })}
                required
                placeholder="VD: -20 (giảm 20%), 30 (tăng 30%)"
              />
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Ngày bắt đầu"
                  name="startDate"
                  type="date"
                  value={newPhase.startDate}
                  onChange={(val) => setNewPhase({ ...newPhase, startDate: val })}
                  required
                />
                <FormInput
                  label="Ngày kết thúc"
                  name="endDate"
                  type="date"
                  value={newPhase.endDate}
                  onChange={(val) => setNewPhase({ ...newPhase, endDate: val })}
                  required
                />
              </div>
              <FormInput
                label="Số lượng slot"
                name="totalslot"
                type="number"
                value={newPhase.totalslot}
                onChange={(val) => setNewPhase({ ...newPhase, totalslot: Number(val) })}
                required
              />
              <Button onClick={handleAddPhase}>Thêm giai đoạn</Button>
            </div>
          </div>

          {/* SUMMARY */}
          {(tickets.length > 0 || phases.length > 0) && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h5 className="font-medium text-green-900 mb-2">📊 Tóm tắt</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✓ Tổng số loại vé: {tickets.length}</li>
                <li>✓ Tổng số giai đoạn: {phases.length}</li>
                {tickets.length > 0 && (
                  <li>
                    ✓ Tổng slot vé: {tickets.reduce((sum, t) => sum + t.totalSlot, 0)}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      );


      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Timeline & Giai đoạn</h3>
            {stepLoadings.researchPhase && (
              <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
                ⏳ Đang xử lý...
              </div>
            )}
            
            {/* Registration Phase */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">📝 Đăng ký tham dự</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Ngày bắt đầu"
                  type="date"
                  name="registrationStartDate"
                  value={researchPhase.registrationStartDate}
                  onChange={(val) => setResearchPhase({ ...researchPhase, registrationStartDate: val })}
                  required
                />
                <FormInput
                  label="Ngày kết thúc"
                  type="date"
                  name="registrationEndDate"
                  value={researchPhase.registrationEndDate}
                  onChange={(val) => setResearchPhase({ ...researchPhase, registrationEndDate: val })}
                  required
                />
              </div>
            </div>

            {/* Full Paper Phase */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">📄 Nộp bài full paper</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Ngày bắt đầu"
                  type="date"
                  name="fullPaperStartDate"
                  value={researchPhase.fullPaperStartDate}
                  onChange={(val) => setResearchPhase({ ...researchPhase, fullPaperStartDate: val })}
                  required
                />
                <FormInput
                  label="Ngày kết thúc"
                  type="date"
                  name="fullPaperEndDate"
                  value={researchPhase.fullPaperEndDate}
                  onChange={(val) => setResearchPhase({ ...researchPhase, fullPaperEndDate: val })}
                  required
                />
              </div>
            </div>

            {/* Review Phase */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">🔍 Phản biện</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Ngày bắt đầu"
                  type="date"
                  name="reviewStartDate"
                  value={researchPhase.reviewStartDate}
                  onChange={(val) => setResearchPhase({ ...researchPhase, reviewStartDate: val })}
                />
                <FormInput
                  label="Ngày kết thúc"
                  type="date"
                  name="reviewEndDate"
                  value={researchPhase.reviewEndDate}
                  onChange={(val) => setResearchPhase({ ...researchPhase, reviewEndDate: val })}
                />
              </div>
            </div>

            {/* Revision Phase */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">✏️ Chỉnh sửa</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Ngày bắt đầu"
                  type="date"
                  name="reviseStartDate"
                  value={researchPhase.reviseStartDate}
                  onChange={(val) => setResearchPhase({ ...researchPhase, reviseStartDate: val })}
                />
                <FormInput
                  label="Ngày kết thúc"
                  type="date"
                  name="reviseEndDate"
                  value={researchPhase.reviseEndDate}
                  onChange={(val) => setResearchPhase({ ...researchPhase, reviseEndDate: val })}
                />
              </div>
              
              {/* Revision Round Deadlines */}
              <div className="mt-4 border-t pt-3">
                <h5 className="font-medium mb-2">Deadline từng vòng chỉnh sửa</h5>
                {revisionRoundDeadlines.map((round, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded mb-2 flex justify-between items-center">
                    <div className="text-sm">
                      Vòng {round.roundNumber}: {round.endDate}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRevisionRoundDeadlines(revisionRoundDeadlines.filter((_, i) => i !== idx))}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <FormInput
                    label="Vòng"
                    type="number"
                    name="roundNumber"
                    value={newRevisionRound.roundNumber}
                    onChange={(val) => setNewRevisionRound({ ...newRevisionRound, roundNumber: Number(val) })}
                  />
                  <FormInput
                    label="Deadline"
                    type="date"
                    name="endDate"
                    value={newRevisionRound.endDate}
                    onChange={(val) => setNewRevisionRound({ ...newRevisionRound, endDate: val })}
                  />
                  <Button onClick={handleAddRevisionRound} className="mt-6">Thêm</Button>
                </div>
              </div>
            </div>

            {/* Camera Ready Phase */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">📸 Camera Ready</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Ngày bắt đầu"
                  type="date"
                  name="cameraReadyStartDate"
                  value={researchPhase.cameraReadyStartDate}
                  onChange={(val) => setResearchPhase({ ...researchPhase, cameraReadyStartDate: val })}
                />
                <FormInput
                  label="Ngày kết thúc"
                  type="date"
                  name="cameraReadyEndDate"
                  value={researchPhase.cameraReadyEndDate}
                  onChange={(val) => setResearchPhase({ ...researchPhase, cameraReadyEndDate: val })}
                />
              </div>
            </div>

            {/* Settings */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">⚙️ Cài đặt</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isWaitlist"
                    checked={researchPhase.isWaitlist}
                    onChange={(e) => setResearchPhase({ ...researchPhase, isWaitlist: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isWaitlist" className="text-sm font-medium">
                    Cho phép danh sách chờ
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={researchPhase.isActive}
                    onChange={(e) => setResearchPhase({ ...researchPhase, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Kích hoạt timeline
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Phiên họp</h3>
            {stepLoadings.sessions && (
              <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
                ⏳ Đang xử lý...
              </div>
            )}

            <div className="space-y-2">
              {sessions.length === 0 ? (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded">
                  Chưa có phiên họp nào. Thêm phiên họp mới bên dưới.
                </div>
              ) : (
                sessions.map((s, idx) => {
                  const room = roomsData?.data.find(
                    (r: RoomInfoResponse) => r.roomId === s.roomId
                  );
                  return (
                    <div
                      key={s.sessionId || idx}
                      className="p-3 bg-gray-50 rounded flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{s.title || "Không có tiêu đề"}</div>
                        <div className="text-sm text-gray-600">
                          {s.date} | {s.startTime} - {s.endTime}
                        </div>
                        {room && (
                          <div className="text-xs text-gray-500">
                            Phòng: {room.number} - {room.displayName}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewSession(s);
                            setSessions(sessions.filter((_, i) => i !== idx));
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSessions(sessions.filter((_, i) => i !== idx))}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border p-4 rounded space-y-3">
              <h4 className="font-medium">Thêm phiên mới</h4>
              <FormInput
                label="Tiêu đề"
                name="title"
                value={newSession.title}
                onChange={(val) => setNewSession({ ...newSession, title: val })}
              />
              <FormTextArea
                label="Mô tả"
                name="description"
                value={newSession.description || ""}
                onChange={(val) => setNewSession({ ...newSession, description: val })}
                rows={2}
              />
              <FormInput
                label="Ngày"
                type="date"
                name="date"
                value={newSession.date}
                onChange={(val) => setNewSession({ ...newSession, date: val })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Thời gian bắt đầu"
                  type="datetime-local"
                  name="startTime"
                  value={newSession.startTime}
                  onChange={(val) => setNewSession({ ...newSession, startTime: val })}
                />
                <FormInput
                  label="Thời gian kết thúc"
                  type="datetime-local"
                  name="endTime"
                  value={newSession.endTime}
                  onChange={(val) => setNewSession({ ...newSession, endTime: val })}
                />
              </div>
              <FormSelect
                label="Phòng"
                name="roomId"
                value={newSession.roomId}
                onChange={(val) => setNewSession({ ...newSession, roomId: val })}
                options={roomOptions}
                required
                disabled={isRoomsLoading}
              />
              <Button onClick={handleAddSession}>Thêm phiên</Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chính sách</h3>
            {stepLoadings.policies && (
              <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
                ⏳ Đang xử lý...
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">📜 Điều khoản & Điều kiện</h4>
              <div className="space-y-2">
                {policies.map((p, idx) => (
                  <div
                    key={p.policyId || idx}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{p.policyName}</div>
                      <div className="text-sm text-gray-600">{p.description}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setPolicies(policies.filter((_, i) => i !== idx))}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3 border-t pt-3">
                <h5 className="font-medium">Thêm điều khoản</h5>
                <FormInput
                  label="Tên điều khoản"
                  name="policyName"
                  value={newPolicy.policyName}
                  onChange={(val) => setNewPolicy({ ...newPolicy, policyName: val })}
                />
                <FormTextArea
                  label="Mô tả"
                  name="description"
                  value={newPolicy.description || ""}
                  onChange={(val) => setNewPolicy({ ...newPolicy, description: val })}
                  rows={3}
                />
                <Button onClick={handleAddPolicy}>Thêm điều khoản</Button>
              </div>
            </div>

            {/* Refund Policies */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">💰 Chính sách hoàn tiền</h4>
              <div className="space-y-2">
                {refundPolicies.map((rp, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">Hoàn {rp.percentRefund}%</div>
                      <div className="text-sm text-gray-600">
                        Trước ngày: {rp.refundDeadline} | Thứ tự: {rp.refundOrder}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRefundPolicies(refundPolicies.filter((_, i) => i !== idx))}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3 border-t pt-3">
                <h5 className="font-medium">Thêm chính sách hoàn tiền</h5>
                <div className="grid grid-cols-3 gap-3">
                  <FormInput
                    label="% Hoàn tiền"
                    type="number"
                    name="percentRefund"
                    value={newRefundPolicy.percentRefund}
                    onChange={(val) => setNewRefundPolicy({ ...newRefundPolicy, percentRefund: Number(val) })}
                  />
                  <FormInput
                    label="Deadline"
                    type="date"
                    name="refundDeadline"
                    value={newRefundPolicy.refundDeadline}
                    onChange={(val) => setNewRefundPolicy({ ...newRefundPolicy, refundDeadline: val })}
                  />
                  <FormInput
                    label="Thứ tự"
                    type="number"
                    name="refundOrder"
                    value={newRefundPolicy.refundOrder}
                    onChange={(val) => setNewRefundPolicy({ ...newRefundPolicy, refundOrder: Number(val) })}
                  />
                </div>
                <Button onClick={handleAddRefundPolicy}>Thêm chính sách</Button>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tài liệu & Xếp hạng</h3>
            {stepLoadings.materials && (
              <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
                ⏳ Đang xử lý...
              </div>
            )}

            {/* Research Materials */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">📚 Tài liệu nghiên cứu</h4>
              <div className="space-y-2">
                {researchMaterials.map((m, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">{m.fileName}</div>
                      <div className="text-sm text-gray-600">{m.fileDescription}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setResearchMaterials(researchMaterials.filter((_, i) => i !== idx))}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3 border-t pt-3">
                <h5 className="font-medium">Thêm tài liệu</h5>
                <FormInput
                  label="Tên file"
                  name="fileName"
                  value={newMaterial.fileName}
                  onChange={(val) => setNewMaterial({ ...newMaterial, fileName: val })}
                  required
                />
                <FormTextArea
                  label="Mô tả"
                  name="fileDescription"
                  value={newMaterial.fileDescription || ""}
                  onChange={(val) => setNewMaterial({ ...newMaterial, fileDescription: val })}
                  rows={2}
                />
                <div>
                  <label className="block text-sm font-medium mb-2">File</label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, file: e.target.files?.[0] || null })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <Button onClick={handleAddMaterial}>Thêm tài liệu</Button>
              </div>
            </div>

            {/* Ranking Files */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">🏆 File xếp hạng</h4>
              <div className="space-y-2">
                {rankingFiles.map((rf, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                    <div className="text-sm">{rf.fileUrl || "File uploaded"}</div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRankingFiles(rankingFiles.filter((_, i) => i !== idx))}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3 border-t pt-3">
                <h5 className="font-medium">Thêm file xếp hạng</h5>
                <FormInput
                  label="URL file"
                  value={newRankingFile.fileUrl || ""}
                  onChange={(val) => setNewRankingFile({ ...newRankingFile, fileUrl: val })}
                  placeholder="https://..."
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Hoặc upload file</label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setNewRankingFile({ ...newRankingFile, file: e.target.files?.[0] || null })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <Button onClick={handleAddRankingFile}>Thêm file</Button>
              </div>
            </div>

            {/* Ranking References */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">🔗 Tham khảo xếp hạng</h4>
              <div className="space-y-2">
                {rankingReferences.map((rr, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                    <div className="text-sm break-all">{rr.referenceUrl}</div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRankingReferences(rankingReferences.filter((_, i) => i !== idx))}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3 border-t pt-3">
                <h5 className="font-medium">Thêm URL tham khảo</h5>
                <FormInput
                  label="URL"
                  value={newRankingReference.referenceUrl}
                  onChange={(val) => setNewRankingReference({ referenceUrl: val })}
                  placeholder="https://..."
                  required
                />
                <Button onClick={handleAddRankingReference}>Thêm URL</Button>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Media</h3>
            {stepLoadings.media && (
              <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
                ⏳ Đang xử lý...
              </div>
            )}

            <div className="space-y-2">
              {mediaList.map((m, idx) => (
                <div key={m.mediaId || idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {typeof m.mediaFile === "string" && m.mediaFile && (
                      <img
                        src={m.mediaFile}
                        alt="Media"
                        className="h-16 w-16 object-cover rounded"
                      />
                    )}
                    <div className="text-sm">
                      {typeof m.mediaFile === "string"
                        ? m.mediaFile
                        : m.mediaFile instanceof File
                        ? m.mediaFile.name
                        : "No file"}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setMediaList(mediaList.filter((_, i) => i !== idx))}
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>

            <div className="border p-4 rounded space-y-3">
              <h4 className="font-medium">Thêm media</h4>
              <div>
                <label className="block text-sm font-medium mb-2">Media File</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewMedia({
                      ...newMedia,
                      mediaFile: e.target.files?.[0] || null,
                    })
                  }
                  accept="image/*,video/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <Button onClick={handleAddMedia}>Thêm media</Button>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nhà tài trợ</h3>
            {stepLoadings.sponsors && (
              <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
                ⏳ Đang xử lý...
              </div>
            )}

            <div className="space-y-2">
              {sponsors.map((s, idx) => (
                <div
                  key={s.sponsorId || idx}
                  className="p-3 bg-gray-50 rounded flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    {typeof s.imageFile === "string" && s.imageFile && (
                      <img
                        src={s.imageFile}
                        alt={s.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{s.name}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewSponsor(s);
                        setSponsors(sponsors.filter((_, i) => i !== idx));
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setSponsors(sponsors.filter((_, i) => i !== idx))}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border p-4 rounded space-y-3">
              <h4 className="font-medium">Thêm nhà tài trợ</h4>
              <FormInput
                label="Tên"
                value={newSponsor.name}
                onChange={(val) => setNewSponsor({ ...newSponsor, name: val })}
              />
              <div>
                <label className="block text-sm font-medium mb-2">Logo Nhà tài trợ</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewSponsor({
                      ...newSponsor,
                      imageFile: e.target.files?.[0] || null,
                    })
                  }
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <Button onClick={handleAddSponsor}>Thêm nhà tài trợ</Button>
            </div>

            {isEditMode && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Tóm tắt</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Hội thảo: {basicForm.conferenceName}</li>
                  <li>✓ Chi tiết nghiên cứu: {researchDetail.name}</li>
                  <li>✓ Phiên họp: {sessions.length}</li>
                  <li>✓ Chính sách: {policies.length} điều khoản, {refundPolicies.length} hoàn tiền</li>
                  <li>✓ Tài liệu: {researchMaterials.length}</li>
                  <li>✓ Media: {mediaList.length}</li>
                  <li>✓ Nhà tài trợ: {sponsors.length}</li>
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const isLoading = Object.values(stepLoadings).some((loading) => loading);

  const getButtonLabel = () => {
    if (isLoading) return "Đang xử lý...";
    
    if (currentStep === 9) {
      return isEditMode ? "💾 Lưu tất cả thay đổi" : "Hoàn thành";
    }
    
    return isEditMode ? "Tiếp theo ➔" : "Tiếp theo";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {isEditMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            🔧 Chế độ chỉnh sửa - Thay đổi sẽ được lưu khi bạn nhấn &quot;Lưu tất cả thay đổi&quot; ở bước cuối
          </p>
        </div>
      )}

      {/* Global Loading Indicator */}
      {isLoading && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
            <p className="text-sm text-yellow-800 font-medium">
              Đang xử lý... Vui lòng đợi
            </p>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
  <div className="text-center mb-4">
    <p className="text-sm text-gray-600">
      Bước <span className="font-semibold text-blue-600">{currentStep}</span> / {maxStep}
    </p>
  </div>

        <div className="flex items-center justify-between">
          {RESEARCH_STEPS.map((step) => (
            <div
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`flex-1 text-center ${
                step.id === currentStep
                  ? "text-blue-600 font-semibold"
                  : "text-gray-400"
              } ${isEditMode ? "cursor-pointer hover:text-blue-500" : ""}`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${
                  step.id === currentStep
                    ? "bg-blue-600 text-white"
                    : isEditMode
                    ? "bg-gray-200 hover:bg-gray-300"
                    : "bg-gray-200"
                }`}
              >
                {step.id}
              </div>
              <div className="text-xs">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border rounded-lg p-6 mb-6">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={() => dispatch(prevStep())}
          disabled={currentStep === 1 || isLoading}
          variant="outline"
          className="px-6"
        >
          ← Quay lại
        </Button>
        <div className="flex gap-3">
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="px-6" disabled={isLoading}>
              Hủy
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="px-6 bg-blue-600 text-white hover:bg-blue-700"
          >
            {getButtonLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
}