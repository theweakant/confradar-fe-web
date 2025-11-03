import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormSelect } from "@/components/molecules/FormSelect";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  useCreateBasicConferenceMutation,
  useUpdateBasicConferenceMutation,
  useCreateConferencePriceMutation,
  useUpdateConferencePriceMutation,
  useCreateConferenceSessionsMutation,
  useUpdateConferenceSessionMutation,
  useUpdateConferenceSpeakerMutation,
  useCreateConferencePoliciesMutation,
  useUpdateConferencePolicyMutation,
  useCreateConferenceMediaMutation,
  useUpdateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,
  useUpdateConferenceSponsorMutation,
} from "@/redux/services/conferenceStep.service";

import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
import { useGetAllRoomsQuery } from "@/redux/services/room.service";
import { useGetAllCitiesQuery } from "@/redux/services/city.service"; 


import {
  nextStep,
  prevStep,
  goToStep,
  setConferenceId,
  setMode,
  resetWizard,
} from "@/redux/slices/conferenceStep.slice";
import type {
  ConferenceBasicForm,
  ConferencePriceData,  
  Phase,  
  Ticket,  
  Session,
  Speaker,  
  Policy,

  Media,
  Sponsor,
  Conference,
  RoomInfoResponse
} from "@/types/conference.type";
import { toast } from "sonner";


const STEPS = [
  { id: 1, title: "Thông tin cơ bản" },
  { id: 2, title: "Giá vé" },
  { id: 3, title: "Session" },
  { id: 4, title: "Chính sách" },
  { id: 5, title: "Media" },
  { id: 6, title: "Nhà tài trợ" },
];

interface ConferenceStepFormProps {
  conference?: Conference | null;
  onSave?: (data: Conference) => void;
  onCancel?: () => void;
}

export function ConferenceStepForm({
  conference,
  onSave,
  onCancel,
}: ConferenceStepFormProps) {
  const dispatch = useAppDispatch();
  const { currentStep, conferenceId: reduxConferenceId, mode: reduxMode } = useAppSelector(
    (state) => state.conferenceStep
  );

  const isEditMode = reduxMode === 'edit' || !!conference;
  const conferenceId = isEditMode ? conference?.conferenceId : reduxConferenceId;

  // API Mutations - CREATE
  const [createBasic] = useCreateBasicConferenceMutation();
  const [createPrice] = useCreateConferencePriceMutation();
  const [createSessions] = useCreateConferenceSessionsMutation();
  const [createPolicies] = useCreateConferencePoliciesMutation();
  const [createMedia] = useCreateConferenceMediaMutation();
  const [createSponsors] = useCreateConferenceSponsorsMutation();

  // API Mutations - UPDATE
  const [updateBasic] = useUpdateBasicConferenceMutation();
  const [updatePrice] = useUpdateConferencePriceMutation();
  const [updateSession] = useUpdateConferenceSessionMutation();
  const [updateSpeaker] = useUpdateConferenceSpeakerMutation();
  const [updatePolicy] = useUpdateConferencePolicyMutation();
  const [updateMedia] = useUpdateConferenceMediaMutation();
  const [updateSponsor] = useUpdateConferenceSponsorMutation();

  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();
  const { data: citiesData, isLoading: isCitiesLoading } = useGetAllCitiesQuery(); 


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

  // ============================================
  // LOADING STATES PER STEP
  // ============================================
  const [stepLoadings, setStepLoadings] = useState({
    basic: false,
    prices: false,
    sessions: false,
    speakers: false,
    policies: false,
    media: false,
    sponsors: false,
  });

  // Step 1: Basic Info
  const [basicForm, setBasicForm] = useState<ConferenceBasicForm>({
    conferenceName: "",
    description: "",
    startDate: "",
    endDate: "",
    totalSlot: 0,
    address: "",
    bannerImageFile: null,
    isInternalHosted: false,
    isResearchConference: false,
    conferenceCategoryId: "",  
    cityId: "", 
    ticketSaleStart: "",  
    ticketSaleEnd: "",  
    createdby: "",  
    targetAudienceTechnicalConference: "",  
  });
  const [existingBannerUrl, setExistingBannerUrl] = useState<string>("");

  // Step 2: Price
  const [phases, setPhases] = useState<Phase[]>([]);  
  const [newPhase, setNewPhase] = useState<Phase>({  
    phaseName: "",
    applyPercent: 0,
    startDate: "",
    endDate: "",
    totalslot: 0,
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);  
  const [newTicket, setNewTicket] = useState<Ticket>({  
    ticketPrice: 0,
    ticketName: "",
    ticketDescription: "",  
    isAuthor: false,  
    totalSlot: 0,  
  });

  // Step 3: Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
const [newSession, setNewSession] = useState<Session>({
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  date: "",  
  roomId: "",
  speaker: [],
  sessionMedias: [],
});

  // Step 4: Policies
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [newPolicy, setNewPolicy] = useState<Policy>({
    policyName: "",
    description: "",
  });

  // Step 5: Media
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [newMedia, setNewMedia] = useState<Media>({
    mediaFile: "",
  });

  // Step 6: Sponsors
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [newSponsor, setNewSponsor] = useState<Sponsor>({
    name: "",
    imageFile: "",
  });

  // Load data in edit mode
  useEffect(() => {
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
      isInternalHosted: conf.isInternalHosted ?? false,
      isResearchConference: conf.isResearchConference ?? false,
      conferenceCategoryId: conf.conferenceCategoryId || "",  
      cityId: conf.cityId || "",  
      ticketSaleStart: conf.ticketSaleStart ? conf.ticketSaleStart.split("T")[0] : "",  
      ticketSaleEnd: conf.ticketSaleEnd ? conf.ticketSaleEnd.split("T")[0] : "",  
      createdby: conf.createdby || "",  
      targetAudienceTechnicalConference: conf.targetAudienceTechnicalConference || "",  
    });
    setExistingBannerUrl(conf.bannerImageUrl || "");

    // Step 2: Prices - INCLUDE priceId
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

    // ✅ Thêm load phases nếu có
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


// Step 3: Sessions 
if (conf.sessions && conf.sessions.length > 0) {
  const transformedSessions: Session[] = conf.sessions.map((s) => ({
    sessionId: s.sessionId,
    title: s.title ?? "",
    description: s.description ?? "",
    startTime: s.startTime ? s.startTime.slice(0, 16) : "",
    endTime: s.endTime ? s.endTime.slice(0, 16) : "",
    date: s.date ? s.date.split("T")[0] : "", 
    roomId: s.roomId ?? "",
    speaker: s.speaker?.map(sp => ({
      speakerId: sp.speakerId,
      name: sp.name ?? "",
      description: sp.description ?? "",
      image: sp.imageUrl ?? "",
      imageUrl: sp.imageUrl ?? "",
    })) || [],
    sessionMedias: s.sessionMedias?.map(media => ({
      sessionMediaId: media.sessionMediaId,
      mediaFile: media.mediaUrl ?? "",
      mediaUrl: media.mediaUrl ?? "",
    })) || [],
  }));
  setSessions(transformedSessions);
}

    // Step 4: Policies - INCLUDE policyId
    if (conf.policies && conf.policies.length > 0) {
      const transformedPolicies: Policy[] = conf.policies.map((p) => ({
        policyId: p.policyId, 
        policyName: p.policyName ?? "",
        description: p.description ?? "",
      }));
      setPolicies(transformedPolicies);
    }

    // Step 5: Media - INCLUDE mediaId
    if (conf.media && conf.media.length > 0) {
      const transformedMedia: Media[] = conf.media.map((m) => ({
        mediaId: m.mediaId, 
        mediaFile: m.mediaUrl ?? "",
      }));
      setMediaList(transformedMedia);
    }

    // Step 6: Sponsors - INCLUDE sponsorId
    if (conf.sponsors && conf.sponsors.length > 0) {
      const transformedSponsors: Sponsor[] = conf.sponsors.map((s) => ({
        sponsorId: s.sponsorId, 
        name: s.name ?? "",
        imageFile: s.imageUrl ?? "",
      }));
      setSponsors(transformedSponsors);
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
        if (!basicForm.conferenceCategoryId) {
          toast.error("Vui lòng chọn danh mục!");
          return false;
        }
        return true;

      case 2: 
        if (tickets.length === 0) {
          toast.error("Vui lòng thêm ít nhất 1 loại vé!");
          return false;
        }
        if (phases.length === 0) {
          toast.warning("Chưa có giai đoạn giá nào. Bạn có thể thêm sau.");
        }
        return true;


      default:
        return true;
    }
  };

  //Handle Step Submit
  const handleBasicSubmitCreate = async () => {
    try {
      setStepLoadings({ ...stepLoadings, basic: true });
      const result = await createBasic(basicForm).unwrap();
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
      speaker: s.speaker.map(sp => ({
        name: sp.name,
        description: sp.description,
        image: sp.image instanceof File ? sp.image : undefined,
        imageUrl: typeof sp.image === 'string' ? sp.image : undefined,
      })),
      sessionMedias: (s.sessionMedias || []).map(media => ({
        mediaFile: media.mediaFile instanceof File ? media.mediaFile : undefined,
        mediaUrl: typeof media.mediaFile === 'string' ? media.mediaFile : undefined,
      })),
    }));

    const data = { sessions: formattedSessions };
    await createSessions({ conferenceId, data }).unwrap();
    toast.success("Tạo phiên họp thành công!");
    dispatch(nextStep());
  } catch (error) {
    console.error("Failed to create sessions:", error);
    toast.error("Tạo buổi thất bại!");
  } finally {
    setStepLoadings({ ...stepLoadings, sessions: false });
  }
};

  const handlePolicySubmitCreate = async () => {
    if (!conferenceId) return;
    try {
      setStepLoadings({ ...stepLoadings, policies: true });
      const data = { policies };
      await createPolicies({ conferenceId, data }).unwrap();
      toast.success("Tạo chính sách thành công!");
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create policies:", error);
      toast.error("Tạo chính sách thất bại!");
    } finally {
      setStepLoadings({ ...stepLoadings, policies: false });
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
      toast.success("Tạo hội thảo thành công!");
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
  // EDIT MODE - Save All Changes at Step 6
  // ============================================
  const handleSaveAllChanges = async () => {
    if (!conferenceId) {
      toast.error("Không tìm thấy ID hội thảo!");
      return;
    }

    try {
      // ========================================
      // STEP 1: UPDATE BASIC INFO
      // ========================================
      setStepLoadings((prev) => ({ ...prev, basic: true }));
      try {
        await updateBasic({ conferenceId, data: basicForm }).unwrap();
        toast.success("Basic info updated!");
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update basic info";

        console.error("Failed to update basic:", error);
        toast.error(message);
      }finally {
        setStepLoadings((prev) => ({ ...prev, basic: false }));
      }

      // ========================================
      // STEP 2: UPDATE/CREATE PRICES
      // ========================================
      setStepLoadings((prev) => ({ ...prev, prices: true }));
      let priceUpdated = 0;
      let priceCreated = 0;
      let priceFailed = 0;

      const pricePromises = tickets.map(async (ticket) => {
        try {
          if (ticket.ticketId) {
            // UPDATE existing ticket
            await updatePrice({
              ticketId: ticket.ticketId,
              data: {
                ticketPrice: ticket.ticketPrice,
                ticketName: ticket.ticketName,
                ticketDescription: ticket.ticketDescription,
                isAuthor: ticket.isAuthor,
                totalSlot: ticket.totalSlot,
              },
            }).unwrap();
            priceUpdated++;
          } else {
      const data: ConferencePriceData = {
            typeOfTicket: ticket,
            phases
          };
          await createPrice({ conferenceId, data }).unwrap();
          priceCreated++;
        }
      } catch (error) {
        console.error("Ticket operation failed:", error);
        priceFailed++;
      }
      });

      await Promise.all(pricePromises);
      setStepLoadings((prev) => ({ ...prev, prices: false }));

      if (priceFailed > 0) {
        toast.error(
          `❌ Prices: Updated ${priceUpdated}, created ${priceCreated}, failed ${priceFailed}`
        );
      } else {
        toast.success(`✅ Prices: Updated ${priceUpdated}, created ${priceCreated}`);
      }

      // ========================================
      // STEP 3: UPDATE/CREATE SESSIONS
      // ========================================
      setStepLoadings((prev) => ({ ...prev, sessions: true }));
      let sessionUpdated = 0;
      let sessionCreated = 0;
      let sessionFailed = 0;

      const sessionPromises = sessions.map(async (session) => {
        try {
          if (session.sessionId) {
            // UPDATE existing session
            await updateSession({
              sessionId: session.sessionId,
              data: {
                title: session.title,
                description: session.description,
                startTime: new Date(session.startTime).toISOString(),
                endTime: new Date(session.endTime).toISOString(),
                date: session.date,
                roomId: session.roomId,
              },
            }).unwrap();
            sessionUpdated++;
          } else {
            // CREATE new session
            await createSessions({
              conferenceId,
              data: {
                sessions: [
                  {
                    title: session.title,
                    description: session.description,
                    date: session.date,
                    startTime: new Date(session.startTime).toISOString(),
                    endTime: new Date(session.endTime).toISOString(),
                    roomId: session.roomId,
                    speaker: {
                      name: session.speaker?.name || "",
                      description: session.speaker?.description || "",
                    },
                  },
                ],
              },
            }).unwrap();
            sessionCreated++;
          }
        } catch (error) {
          console.error("Session operation failed:", error);
          sessionFailed++;
        }
      });

      await Promise.all(sessionPromises);
      setStepLoadings((prev) => ({ ...prev, sessions: false }));

      if (sessionFailed > 0) {
        toast.error(
          `❌ Sessions: Updated ${sessionUpdated}, created ${sessionCreated}, failed ${sessionFailed}`
        );
      } else {
        toast.success(`✅ Sessions: Updated ${sessionUpdated}, created ${sessionCreated}`);
      }

      // ========================================
      // STEP 3B: UPDATE SPEAKERS
      // ========================================
      setStepLoadings((prev) => ({ ...prev, speakers: true }));
      let speakerUpdated = 0;
      let speakerFailed = 0;

      const speakerPromises = sessions
        .filter((s) => s.sessionId && s.speaker) 
        .map(async (session) => {
          try {
            await updateSpeaker({
              sessionId: session.sessionId!, 
              data: {
                name: session.speaker?.name || "",
                description: session.speaker?.description || "",
              },
            }).unwrap();
            speakerUpdated++;
          } catch (error) {
            console.error("Speaker update failed:", error);
            speakerFailed++;
          }
        });

      await Promise.all(speakerPromises);
      setStepLoadings((prev) => ({ ...prev, speakers: false }));

      if (speakerFailed > 0) {
        toast.error(`❌ Speakers: Updated ${speakerUpdated}, failed ${speakerFailed}`);
      } else if (speakerUpdated > 0) {
        toast.success(`✅ Speakers: Updated ${speakerUpdated}`);
      }

      // ========================================
      // STEP 4: UPDATE/CREATE POLICIES
      // ========================================
      setStepLoadings((prev) => ({ ...prev, policies: true }));
      let policyUpdated = 0;
      let policyCreated = 0;
      let policyFailed = 0;

      const policyPromises = policies.map(async (policy) => {
        try {
          if (policy.policyId) {
            // UPDATE existing policy
            await updatePolicy({
              policyId: policy.policyId,
              data: {
                policyName: policy.policyName,
                description: policy.description,
              },
            }).unwrap();
            policyUpdated++;
          } else {
            // CREATE new policy
            await createPolicies({
              conferenceId,
              data: { policies: [policy] },
            }).unwrap();
            policyCreated++;
          }
        } catch (error) {
          console.error("Policy operation failed:", error);
          policyFailed++;
        }
      });

      await Promise.all(policyPromises);
      setStepLoadings((prev) => ({ ...prev, policies: false }));

      if (policyFailed > 0) {
        toast.error(
          `❌ Policies: Updated ${policyUpdated}, created ${policyCreated}, failed ${policyFailed}`
        );
      } else {
        toast.success(`✅ Policies: Updated ${policyUpdated}, created ${policyCreated}`);
      }

      // ========================================
      // STEP 5: UPDATE/CREATE MEDIA (only if File)
      // ========================================
      setStepLoadings((prev) => ({ ...prev, media: true }));
      let mediaUpdated = 0;
      let mediaCreated = 0;
      let mediaSkipped = 0;
      let mediaFailed = 0;

      const mediaPromises = mediaList.map(async (media) => {
        try {
          // Skip if not a File (string URL)
          if (typeof media.mediaFile === "string") {
            mediaSkipped++;
            return;
          }

          if (media.mediaId && media.mediaFile instanceof File) {
            // UPDATE existing media with new file
            await updateMedia({
              mediaId: media.mediaId,
              mediaFile: media.mediaFile,
            }).unwrap();
            mediaUpdated++;
          } else if (!media.mediaId && media.mediaFile instanceof File) {
            // CREATE new media
            await createMedia({
              conferenceId,
              data: { media: [media] },
            }).unwrap();
            mediaCreated++;
          }
        } catch (error) {
          console.error("Media operation failed:", error);
          mediaFailed++;
        }
      });

      await Promise.all(mediaPromises);
      setStepLoadings((prev) => ({ ...prev, media: false }));

      if (mediaFailed > 0) {
        toast.error(
          `❌ Media: Updated ${mediaUpdated}, created ${mediaCreated}, skipped ${mediaSkipped}, failed ${mediaFailed}`
        );
      } else {
        toast.success(
          `✅ Media: Updated ${mediaUpdated}, created ${mediaCreated}, skipped ${mediaSkipped}`
        );
      }

      // ========================================
      // STEP 6: UPDATE/CREATE SPONSORS (only if File)
      // ========================================
      setStepLoadings((prev) => ({ ...prev, sponsors: true }));
      let sponsorUpdated = 0;
      let sponsorCreated = 0;
      let sponsorSkipped = 0;
      let sponsorFailed = 0;

      const sponsorPromises = sponsors.map(async (sponsor) => {
        try {
          // Skip if not a File (string URL)
          if (typeof sponsor.imageFile === "string") {
            sponsorSkipped++;
            return;
          }

          if (sponsor.sponsorId && sponsor.imageFile instanceof File) {
            // UPDATE existing sponsor with new image
            await updateSponsor({
              sponsorId: sponsor.sponsorId,

              
              name: sponsor.name,
              imageFile: sponsor.imageFile,
            }).unwrap();
            sponsorUpdated++;
          } else if (!sponsor.sponsorId && sponsor.imageFile instanceof File) {
            // CREATE new sponsor
            await createSponsors({
              conferenceId,
              data: { sponsors: [sponsor] },
            }).unwrap();
            sponsorCreated++;
          }
        } catch (error) {
          console.error("Sponsor operation failed:", error);
          sponsorFailed++;
        }
      });

      await Promise.all(sponsorPromises);
      setStepLoadings((prev) => ({ ...prev, sponsors: false }));

      if (sponsorFailed > 0) {
        toast.error(
          `❌ Sponsors: Updated ${sponsorUpdated}, created ${sponsorCreated}, skipped ${sponsorSkipped}, failed ${sponsorFailed}`
        );
      } else {
        toast.success(
          `✅ Sponsors: Updated ${sponsorUpdated}, created ${sponsorCreated}, skipped ${sponsorSkipped}`
        );
      }

      // ========================================
      // FINAL SUCCESS
      // ========================================
      toast.success("🎉 All changes saved successfully!");

      if (onSave && conference) {
        onSave(conference);
      }

      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("❌ Unexpected error occurred!");
    }
  };

  // ============================================
  // NAVIGATION HANDLER
  // ============================================
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (isEditMode) {
      if (currentStep === 6) {
        handleSaveAllChanges();
      } else {
        dispatch(nextStep());
      }
    } else {
      switch (currentStep) {
        case 1:
          handleBasicSubmitCreate();
          break;
        case 2:
          handlePriceSubmitCreate();
          break;
        case 3:
          handleSessionSubmitCreate();
          break;
        case 4:
          handlePolicySubmitCreate();
          break;
        case 5:
          handleMediaSubmitCreate();
          break;
        case 6:
          handleSponsorSubmitCreate();
          break;
      }
    }
  };

  // Add handlers
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

  const handleAddSession = () => {
    if (!newSession.title || !newSession.speaker?.name) return;
    setSessions([...sessions, newSession]);
    setNewSession({
      title: "",
      description: "",
      date:"",
      startTime: "",
      endTime: "",
      roomId: "",
      speaker: { name: "", description: "" },
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

  const handleAddPolicy = () => {
    if (!newPolicy.policyName) return;
    setPolicies([...policies, newPolicy]);
    setNewPolicy({ policyName: "", description: "" });
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

  const handleStepClick = (stepId: number) => {
    if (isEditMode) {
      dispatch(goToStep(stepId));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
            {stepLoadings.basic && (
              <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
                ⏳ Đang cập nhật thông tin cơ bản...
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
              value={basicForm.description ?? ""}
              onChange={(val) => setBasicForm({ ...basicForm, description: val })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Ngày bắt đầu giai"
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
            <FormInput
              label="Sức chứa"
              name="totalSlot"
              type="number"
              value={basicForm.totalSlot}
              onChange={(val) => setBasicForm({ ...basicForm, totalSlot: Number(val) })}
            />
            <FormInput
              label="Địa chỉ"
              name="address"
              value={basicForm.address}
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
  label="Người tạo"
  name="createdby"
  value={basicForm.createdby}
  onChange={(val) => setBasicForm({ ...basicForm, createdby: val })}
/>

<FormTextArea
  label="Đối tượng mục tiêu"
  value={basicForm.targetAudienceTechnicalConference ?? ""}
  onChange={(val) => setBasicForm({ ...basicForm, targetAudienceTechnicalConference: val })}
  rows={2}
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
              label="Số lượng vé"
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
            label="Số lượng vé"
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
          <h5 className="font-medium text-green-900 mb-2">Tóm tắt</h5>
          <ul className="text-sm text-green-800 space-y-1">
            <li>Tổng số loại vé đã tạo: {tickets.length}</li>
            <li>Tổng số giai đoạn: {phases.length}</li>
            {tickets.length > 0 && (
              <li>
                Tổng slot vé: {tickets.reduce((sum, t) => sum + t.totalSlot, 0)}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );

     case 3:
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Phiên họp</h3>
      {stepLoadings.sessions && (
        <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
          ⏳ Đang cập nhật phiên họp...
        </div>
      )}
      {stepLoadings.speakers && (
        <div className="p-2 bg-purple-50 text-purple-700 rounded text-sm">
          ⏳ Đang cập nhật diễn giả...
        </div>
      )}

      <div className="space-y-2">
        {sessions.length === 0 ? (
          <div className="p-3 bg-yellow-50 text-yellow-800 rounded">
            Chưa có phiên họp nào. Thêm phiên họp mới bên dưới.
          </div>
        ) : (
          sessions.map((s, idx) => {
            // 🔍 Tra cứu room từ roomsData dựa trên roomId
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
                    Diễn giả: {s.speaker?.name || "Chưa có diễn giả"}
                  </div>
                  {/* ✅ Hiển thị thông tin phòng nếu tìm thấy */}
                  {room && (
                    <div className="text-xs text-gray-500">
                      Phòng: {room.number} - {room.displayName}
                    </div>
                  )}
                  {s.sessionId && (
                    <div className="text-xs text-blue-600">ID: {s.sessionId}</div>
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
        name="date"
        type="date"
        value={newSession.date}
        onChange={(val) => setNewSession({ ...newSession, date: val })}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label="Thời gian bắt đầu"
          name="startTime"
          type="datetime-local"
          value={newSession.startTime}
          onChange={(val) => setNewSession({ ...newSession, startTime: val })}
        />
        <FormInput
          label="Thời gian kết thúc"
          name="endTime"
          type="datetime-local"
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
<div className="border-t pt-3">
  <h5 className="font-medium mb-2">Diễn giả</h5>
  <FormInput
    label="Tên"
    name="speakerName"
    value={newSession.speaker?.name || ""}
    onChange={(val) =>
      setNewSession({
        ...newSession,
        speaker: { 
          ...(newSession.speaker || { name: "", description: "", image: "" }), 
          name: val 
        },
      })
    }
  />
  <FormTextArea
    label="Mô tả"
    value={newSession.speaker?.description || ""}
    onChange={(val) =>
      setNewSession({
        ...newSession,
        speaker: { 
          ...(newSession.speaker || { name: "", description: "", image: "" }), 
          description: val 
        },
      })
    }
    rows={2}
  />
  {/* ✅ Thêm input cho image */}
  <div className="mt-2">
    <label className="block text-sm font-medium mb-2">Ảnh diễn giả</label>
    <input
      type="file"
      onChange={(e) =>
        setNewSession({
          ...newSession,
          speaker: {
            ...(newSession.speaker || { name: "", description: "", image: "" }),
            image: e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : "",
          },
        })
      }
      accept="image/*"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
    />
  </div>
</div>
              <Button onClick={handleAddSession}>Thêm phiên</Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chính sách</h3>
            {stepLoadings.policies && (
              <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
                ⏳ Đang cập nhật chính sách...
              </div>
            )}

            <div className="space-y-2">
              {policies.length === 0 ? (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded">
                  Chưa có chính sách nào. Thêm chính sách mới bên dưới.
                </div>
              ) : (
                policies.map((p, idx) => (
                  <div
                    key={p.policyId || idx}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{p.policyName || "Không có tên"}</div>
                      <div className="text-sm text-gray-600">{p.description || "Không có mô tả"}</div>
                      {p.policyId && (
                        <div className="text-xs text-blue-600">ID: {p.policyId}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewPolicy(p);
                          setPolicies(policies.filter((_, i) => i !== idx));
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setPolicies(policies.filter((_, i) => i !== idx))}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border p-4 rounded space-y-3">
              <h4 className="font-medium">Thêm chính sách</h4>
              <FormInput
                label="Tên chính sách"
                name="policyName"
                value={newPolicy.policyName}
                onChange={(val) => setNewPolicy({ ...newPolicy, policyName: val })}
              />
              <FormTextArea
                label="Mô tả"
                value={newPolicy.description || ""}
                onChange={(val) => setNewPolicy({ ...newPolicy, description: val })}
                rows={3}
              />
              <Button onClick={handleAddPolicy}>Thêm chính sách</Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Media</h3>
            {stepLoadings.media && (
              <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
                ⏳ Đang cập nhật media...
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
                    <div>
                      <div className="text-sm">
                        {typeof m.mediaFile === "string"
                          ? m.mediaFile
                          : m.mediaFile instanceof File
                          ? m.mediaFile.name
                          : "No file"}
                      </div>
                      {m.mediaId && (
                        <div className="text-xs text-blue-600">ID: {m.mediaId}</div>
                      )}
                      {typeof m.mediaFile === "string" && (
                        <div className="text-xs text-gray-500">(Không đổi - skip update)</div>
                      )}
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
                <label className="block text-sm font-medium mb-2">
                  Media File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewMedia({
                      ...newMedia,
                      mediaFile: e.target.files?.[0] || null,
                    })
                  }
                  accept="image/*,video/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button onClick={handleAddMedia}>Thêm media</Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nhà tài trợ</h3>
            {stepLoadings.sponsors && (
              <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
                ⏳ Đang cập nhật nhà tài trợ...
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
                      <div className="text-sm text-gray-600">
                        {typeof s.imageFile === "string"
                          ? "Logo hiện tại"
                          : s.imageFile instanceof File
                          ? s.imageFile.name
                          : "No image"}
                      </div>
                      {s.sponsorId && (
                        <div className="text-xs text-blue-600">ID: {s.sponsorId}</div>
                      )}
                      {typeof s.imageFile === "string" && (
                        <div className="text-xs text-gray-500">(Không đổi - skip update)</div>
                      )}
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
                name="name"
                value={newSponsor.name}
                onChange={(val) => setNewSponsor({ ...newSponsor, name: val })}
              />
              <div>
                <label className="block text-sm font-medium mb-2">
                  Logo Nhà tài trợ <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setNewSponsor({
                      ...newSponsor,
                      imageFile: e.target.files?.[0] || null,
                    })
                  }
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button onClick={handleAddSponsor}>Thêm nhà tài trợ</Button>
            </div>

            {isEditMode && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Tóm tắt thay đổi</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Thông tin cơ bản: {basicForm.conferenceName}</li>
                  <li>✓ Số loại vé: {tickets.length}</li>
                  <li>✓ Số giai đoạn: {phases.length}</li>
                  <li>✓ Số phiên họp: {sessions.length}</li>
                  <li>✓ Số chính sách: {policies.length}</li>
                  <li>✓ Số media: {mediaList.length}</li>
                  <li>✓ Số nhà tài trợ: {sponsors.length}</li>
                </ul>
                <p className="text-xs text-blue-600 mt-3">
                  Nhấn &quot;Lưu tất cả thay đổi&quot; để cập nhật toàn bộ thông tin
                </p>
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
    
    if (currentStep === 6) {
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

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step) => (
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
              <div className="text-sm">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">{renderStepContent()}</div>

      <div className="flex justify-between">
        <Button
          onClick={() => dispatch(prevStep())}
          disabled={currentStep === 1}
          variant="outline"
          className="px-6"
        >
          ← Quay lại
        </Button>
        <div className="flex gap-3">
          {isEditMode && onCancel && (
            <Button onClick={onCancel} variant="outline" className="px-6">
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