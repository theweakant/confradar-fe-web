// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { FormInput } from "@/components/molecules/FormInput";
// import { FormSelect } from "@/components/molecules/FormSelect";
// import { FormTextArea } from "@/components/molecules/FormTextArea";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
// import {
//   useCreateBasicConferenceMutation,
//   useUpdateBasicConferenceMutation,
//   useCreateConferencePriceMutation,
//   useUpdateConferencePriceMutation,
//   useCreateConferenceSessionsMutation,
//   useUpdateConferenceSessionsMutation,
//   useUpdateConferenceSpeakerMutation,
//   useCreateConferencePoliciesMutation,
//   useUpdateConferencePoliciesMutation,
//   useCreateConferenceMediaMutation,
//   useUpdateConferenceMediaMutation,
//   useCreateConferenceSponsorsMutation,
//   useUpdateConferenceSponsorsMutation,
// } from "@/redux/services/conferenceStep.service";
// import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
// import { useGetAllRoomsQuery } from "@/redux/services/room.service";

// import {
//   nextStep,
//   prevStep,
//   goToStep,
//   setConferenceId,
//   setMode,
//   resetWizard,
// } from "@/redux/slices/conferenceStep.slice";
// import type {
//   ConferenceBasicForm,
//   PricePhase,
//   Price,
//   Session,
//   Policy,
//   Media,
//   Sponsor,
//   ConferenceResponse,
// } from "@/types/conference.type";
// import { toast } from "sonner";

// const STEPS = [
//   { id: 1, title: "Thông tin cơ bản" },
//   { id: 2, title: "Giá vé" },
//   { id: 3, title: "Phiên họp" },
//   { id: 4, title: "Chính sách" },
//   { id: 5, title: "Media" },
//   { id: 6, title: "Nhà tài trợ" },
// ];

// interface ConferenceStepFormProps {
//   conference?: ConferenceResponse | null;
//   onSave?: (data: ConferenceResponse) => void;
//   onCancel?: () => void;
// }

// export function ConferenceStepForm({
//   conference,
//   onSave,
//   onCancel,
// }: ConferenceStepFormProps) {
//   const dispatch = useAppDispatch();
//   const { currentStep, conferenceId: reduxConferenceId, mode: reduxMode } = useAppSelector(
//     (state) => state.conferenceStep
//   );

//   // Detect mode
//   const isEditMode = reduxMode === 'edit' || !!conference;
//   const conferenceId = isEditMode ? conference?.conferenceId : reduxConferenceId;

//   // API Mutations - CREATE
//   const [createBasic, { isLoading: isCreatingBasic }] = useCreateBasicConferenceMutation();
//   const [createPrice, { isLoading: isCreatingPrice }] = useCreateConferencePriceMutation();
//   const [createSessions, { isLoading: isCreatingSessions }] = useCreateConferenceSessionsMutation();
//   const [createPolicies, { isLoading: isCreatingPolicies }] = useCreateConferencePoliciesMutation();
//   const [createMedia, { isLoading: isCreatingMedia }] = useCreateConferenceMediaMutation();
//   const [createSponsors, { isLoading: isCreatingSponsors }] = useCreateConferenceSponsorsMutation();

//   // API Mutations - UPDATE
//   const [updateBasic, { isLoading: isUpdatingBasic }] = useUpdateBasicConferenceMutation();
//   const [updatePrice, { isLoading: isUpdatingPrice }] = useUpdateConferencePriceMutation();
//   const [updateSessions, { isLoading: isUpdatingSessions }] = useUpdateConferenceSessionsMutation();
//   const [updateSpeaker, { isLoading: isUpdatingSpeaker }] = useUpdateConferenceSpeakerMutation();
//   const [updatePolicies, { isLoading: isUpdatingPolicies }] = useUpdateConferencePoliciesMutation();
//   const [updateMedia, { isLoading: isUpdatingMedia }] = useUpdateConferenceMediaMutation();
//   const [updateSponsors, { isLoading: isUpdatingSponsors }] = useUpdateConferenceSponsorsMutation();

//   const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
//   const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();

//   const categoryOptions =
//     categoriesData?.data?.map((category) => ({
//       value: category.categoryId,
//       label: category.conferenceCategoryName,
//     })) || [];

//   const roomOptions =
//     roomsData?.data?.map((room) => ({
//       value: room.roomId,
//       label: `${room.number} - ${room.displayName} - ${room.destinationId}`,
//     })) || [];

//   // Step 1: Basic Info
//   const [basicForm, setBasicForm] = useState<ConferenceBasicForm>({
//     conferenceName: "",
//     description: "",
//     startDate: "",
//     endDate: "",
//     capacity: 0,
//     address: "",
//     bannerImageFile: null,
//     isInternalHosted: true,
//     isResearchConference: false,
//     categoryName: "",
//   });
//   const [existingBannerUrl, setExistingBannerUrl] = useState<string>("");

//   // Step 2: Price
//   const [pricePhase, setPricePhase] = useState<PricePhase>({
//     name: "",
//     earlierBirdEndInterval: "",
//     percentForEarly: 0,
//     standardEndInterval: "",
//     lateEndInterval: "",
//     percentForEnd: 0,
//   });
//   const [prices, setPrices] = useState<Price[]>([]);
//   const [newPrice, setNewPrice] = useState<Price>({
//     ticketPrice: 0,
//     ticketName: "",
//     ticketDescription: "",
//     actualPrice: 0,
//   });

//   // Step 3: Sessions
//   const [sessions, setSessions] = useState<Session[]>([]);
//   const [newSession, setNewSession] = useState<Session>({
//     title: "",
//     description: "",
//     startTime: "",
//     endTime: "",
//     roomId: "",
//     speaker: {
//       name: "",
//       description: "",
//     },
//   });

//   // Step 4: Policies
//   const [policies, setPolicies] = useState<Policy[]>([]);
//   const [newPolicy, setNewPolicy] = useState<Policy>({
//     policyName: "",
//     description: "",
//   });

//   // Step 5: Media
//   const [mediaList, setMediaList] = useState<Media[]>([]);
//   const [newMedia, setNewMedia] = useState<Media>({
//     mediaFile: "",
//   });

//   // Step 6: Sponsors
//   const [sponsors, setSponsors] = useState<Sponsor[]>([]);
//   const [newSponsor, setNewSponsor] = useState<Sponsor>({
//     name: "",
//     imageFile: "",
//   });

//   // Load data in edit mode
//   useEffect(() => {
//     if (isEditMode && conference) {
//       dispatch(setMode('edit'));
//       dispatch(setConferenceId(conference.conferenceId));
//       loadConferenceData(conference);
//     } else {
//       dispatch(setMode('create'));
//     }
//   }, [isEditMode, conference, dispatch]);

//   const loadConferenceData = (conf: ConferenceResponse) => {
//     // Step 1: Basic Info
//     setBasicForm({
//       conferenceName: conf.conferenceName || "",
//       description: conf.description || "",
//       startDate: conf.startDate ? conf.startDate.split("T")[0] : "",
//       endDate: conf.endDate ? conf.endDate.split("T")[0] : "",
//       capacity: conf.capacity || 0,
//       address: conf.address || "",
//       bannerImageFile: null,
//       isInternalHosted: conf.isInternalHosted ?? true,
//       isResearchConference: conf.isResearchConference ?? false,
//       categoryName: conf.categoryId || "",
//     });
//     setExistingBannerUrl(conf.bannerImageUrl || "");

//     // Step 2: Prices
//     if (conf.prices && conf.prices.length > 0) {
//       const transformedPrices: Price[] = conf.prices.map((p) => ({
//         priceId: p.priceId,
//         ticketPrice: p.ticketPrice ?? 0,
//         ticketName: p.ticketName ?? "",
//         ticketDescription: p.ticketDescription ?? "",
//         actualPrice: p.actualPrice ?? 0,
//         currentPhase: p.currentPhase,
//         pricePhaseId: p.pricePhaseId,
//       }));
//       setPrices(transformedPrices);
//     }

//     // Step 3: Sessions
//     if (conf.sessions && conf.sessions.length > 0) {
//       const transformedSessions: Session[] = conf.sessions.map((s) => ({
//         sessionId: s.sessionId,
//         title: s.title ?? "",
//         description: s.description ?? "",
//         startTime: s.startTime ? s.startTime.slice(0, 16) : "",
//         endTime: s.endTime ? s.endTime.slice(0, 16) : "",
//         roomId: s.roomId ?? "",
//         room: s.room,
//         speaker: {
//           name: s.speaker?.name ?? "",
//           description: s.speaker?.description ?? "",
//         },
//       }));
//       setSessions(transformedSessions);
//     }

//     // Step 4: Policies
//     if (conf.policies && conf.policies.length > 0) {
//       const transformedPolicies: Policy[] = conf.policies.map((p) => ({
//         policyName: p.policyName ?? "",
//         description: p.description ?? "",
//       }));
//       setPolicies(transformedPolicies);
//     }

//     // Step 5: Media
//     if (conf.media && conf.media.length > 0) {
//       const transformedMedia: Media[] = conf.media.map((m) => ({
//         mediaFile: m.mediaUrl ?? "",
//       }));
//       setMediaList(transformedMedia);
//     }

//     // Step 6: Sponsors
//     if (conf.sponsors && conf.sponsors.length > 0) {
//       const transformedSponsors: Sponsor[] = conf.sponsors.map((s) => ({
//         name: s.name ?? "",
//         imageFile: s.imageUrl ?? "",
//       }));
//       setSponsors(transformedSponsors);
//     }
//   };

//   // Handle Step 1 Submit
//   const handleBasicSubmit = async () => {
//     try {
//       if (isEditMode && conferenceId) {
//         await updateBasic({ conferenceId, data: basicForm }).unwrap();
//         toast.success("Cập nhật thông tin cơ bản thành công!");
//       } else {
//         const result = await createBasic(basicForm).unwrap();
//         const confId = result.data.conferenceId;
//         dispatch(setConferenceId(confId));
//         toast.success("Tạo thông tin cơ bản thành công!");
//       }
//       dispatch(nextStep());
//     } catch (error) {
//       console.error("Failed to save basic info:", error);
//       toast.error(isEditMode ? "Cập nhật thất bại!" : "Tạo mới thất bại!");
//     }
//   };

//   // Handle Step 2 Submit
//   const handlePriceSubmit = async () => {
//     if (!conferenceId) return;
//     try {
//       const data = { pricePhase, prices };

//       if (isEditMode) {
//         await updatePrice({ conferenceId, data }).unwrap();
//         toast.success("Cập nhật giá vé thành công!");
//       } else {
//         await createPrice({ conferenceId, data }).unwrap();
//         toast.success("Tạo giá vé thành công!");
//       }
//       dispatch(nextStep());
//     } catch (error) {
//       console.error("Failed to save price:", error);
//       toast.error(isEditMode ? "Cập nhật giá vé thất bại!" : "Tạo giá vé thất bại!");
//     }
//   };

//   // Handle Step 3 Submit
// // Handle Step 3 Submit
//   const handleSessionSubmit = async () => {
//     if (!conferenceId) return;
//     try {
//       const formattedSessions = sessions.map((s) => ({
//         title: s.title,
//         description: s.description,
//         startTime: new Date(s.startTime).toISOString(),
//         endTime: new Date(s.endTime).toISOString(),
//         roomId: s.roomId,
//         speaker: {
//           name: s.speaker?.name || "",
//           description: s.speaker?.description || "",
//         },
//       }));

//       const data = { sessions: formattedSessions };

//       if (isEditMode) {
//         // Update sessions first
//         await updateSessions({ conferenceId, data }).unwrap();
        
//         // Then update speakers for each session
//         const speakerUpdatePromises = sessions
//           .filter(s => s.sessionId && s.speaker)
//           .map(s => {
//             const speakerData = {
//               speaker: { 
//                 name: s.speaker?.name || "",
//                 description: s.speaker?.description || "",
//               },
//             };

//             return updateSpeaker({
//               sessionId: s.sessionId!,
//               data: speakerData, 
//             }).unwrap();
//           });
        
//         await Promise.all(speakerUpdatePromises);
        
//         toast.success("Cập nhật phiên họp và diễn giả thành công!");
//       } else {
//         await createSessions({ conferenceId, data }).unwrap();
//         toast.success("Tạo phiên họp thành công!");
//       }
//       dispatch(nextStep());
//     } catch (error) {
//       console.error("Failed to save sessions:", error);
//       toast.error(isEditMode ? "Cập nhật phiên họp thất bại!" : "Tạo phiên họp thất bại!");
//     }
//   };

//   // Handle Step 4 Submit
//   const handlePolicySubmit = async () => {
//     if (!conferenceId) return;
//     try {
//       const data = { policies };

//       if (isEditMode) {
//         await updatePolicies({ conferenceId, data }).unwrap();
//         toast.success("Cập nhật chính sách thành công!");
//       } else {
//         await createPolicies({ conferenceId, data }).unwrap();
//         toast.success("Tạo chính sách thành công!");
//       }
//       dispatch(nextStep());
//     } catch (error) {
//       console.error("Failed to save policies:", error);
//       toast.error(isEditMode ? "Cập nhật chính sách thất bại!" : "Tạo chính sách thất bại!");
//     }
//   };

//   // Handle Step 5 Submit
//   const handleMediaSubmit = async () => {
//     if (!conferenceId) return;
//     try {
//       const data = { media: mediaList };

//       if (isEditMode) {
//         await updateMedia({ conferenceId, data }).unwrap();
//         toast.success("Cập nhật media thành công!");
//       } else {
//         await createMedia({ conferenceId, data }).unwrap();
//         toast.success("Tạo media thành công!");
//       }
//       dispatch(nextStep());
//     } catch (error) {
//       console.error("Failed to save media:", error);
//       toast.error(isEditMode ? "Cập nhật media thất bại!" : "Tạo media thất bại!");
//     }
//   };

//   // Handle Step 6 Submit (Final)
//   const handleSponsorSubmit = async () => {
//     if (!conferenceId) return;
//     try {
//       const data = { sponsors };

//       if (isEditMode) {
//         await updateSponsors({ conferenceId, data }).unwrap();
//         toast.success("Cập nhật nhà tài trợ thành công!");
//         if (onSave && conference) onSave(conference);
//       } else {
//         await createSponsors({ conferenceId, data }).unwrap();
//         toast.success("Tạo hội thảo thành công!");
//         dispatch(resetWizard());
//       }

//       if (onCancel) onCancel();
//     } catch (error) {
//       console.error("Failed to save sponsors:", error);
//       toast.error(isEditMode ? "Cập nhật nhà tài trợ thất bại!" : "Tạo nhà tài trợ thất bại!");
//     }
//   };

//   // Add handlers
//   const handleAddPrice = () => {
//     if (!newPrice.ticketName || !newPrice.ticketPrice) return;
//     setPrices([...prices, newPrice]);
//     setNewPrice({
//       ticketPrice: 0,
//       ticketName: "",
//       ticketDescription: "",
//       actualPrice: 0,
//     });
//   };

//   const handleAddSession = () => {
//     if (!newSession.title || !newSession.speaker?.name) return;
//     setSessions([...sessions, newSession]);
//     setNewSession({
//       title: "",
//       description: "",
//       startTime: "",
//       endTime: "",
//       roomId: "",
//       speaker: { name: "", description: "" },
//     });
//   };

//   const handleAddPolicy = () => {
//     if (!newPolicy.policyName) return;
//     setPolicies([...policies, newPolicy]);
//     setNewPolicy({ policyName: "", description: "" });
//   };

//   const handleAddMedia = () => {
//     if (!newMedia.mediaFile) return;
//     setMediaList([...mediaList, newMedia]);
//     setNewMedia({ mediaFile: "" });
//   };

//   const handleAddSponsor = () => {
//     if (!newSponsor.name) return;
//     setSponsors([...sponsors, newSponsor]);
//     setNewSponsor({ name: "", imageFile: "" });
//   };

//   // Navigation handler for edit mode
//   const handleStepClick = (stepId: number) => {
//     if (isEditMode) {
//       dispatch(goToStep(stepId));
//     }
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
//             <FormInput
//               label="Tên hội thảo"
//               name="conferenceName"
//               value={basicForm.conferenceName}
//               onChange={(val) => setBasicForm({ ...basicForm, conferenceName: val })}
//               required
//             />
//             <FormTextArea
//               label="Mô tả"
//               value={basicForm.description ?? ""}
//               onChange={(val) => setBasicForm({ ...basicForm, description: val })}
//               rows={3}
//             />
//             <div className="grid grid-cols-2 gap-4">
//               <FormInput
//                 label="Ngày bắt đầu"
//                 name="startDate"
//                 type="date"
//                 value={basicForm.startDate}
//                 onChange={(val) => setBasicForm({ ...basicForm, startDate: val })}
//                 required
//               />
//               <FormInput
//                 label="Ngày kết thúc"
//                 name="endDate"
//                 type="date"
//                 value={basicForm.endDate}
//                 onChange={(val) => setBasicForm({ ...basicForm, endDate: val })}
//                 required
//               />
//             </div>
//             <FormInput
//               label="Sức chứa"
//               name="capacity"
//               type="number"
//               value={basicForm.capacity}
//               onChange={(val) => setBasicForm({ ...basicForm, capacity: Number(val) })}
//             />
//             <FormInput
//               label="Địa chỉ"
//               name="address"
//               value={basicForm.address}
//               onChange={(val) => setBasicForm({ ...basicForm, address: val })}
//             />
//             <FormSelect
//               label="Danh mục"
//               name="categoryId"
//               value={basicForm.categoryName}
//               onChange={(val) => setBasicForm({ ...basicForm, categoryName: val })}
//               options={categoryOptions}
//               required
//               disabled={isCategoriesLoading}
//             />
//             <div>
//               <label className="block text-sm font-medium mb-2">Banner Image</label>
//               {isEditMode && existingBannerUrl && !basicForm.bannerImageFile && (
//                 <div className="mb-2">
//                   <img
//                     src={existingBannerUrl}
//                     alt="Current banner"
//                     className="h-32 w-auto object-cover rounded border"
//                   />
//                   <p className="text-sm text-gray-500 mt-1">
//                     Banner hiện tại (upload file mới để thay đổi)
//                   </p>
//                 </div>
//               )}
//               <input
//                 type="file"
//                 onChange={(e) =>
//                   setBasicForm({
//                     ...basicForm,
//                     bannerImageFile: e.target.files?.[0] || null,
//                   })
//                 }
//                 accept="image/*"
//               />
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Giá vé</h3>
//             {/* Prices List */}
//             <div className="border p-4 rounded">
//               <h4 className="font-medium mb-3">Danh sách vé ({prices.length})</h4>
//               {prices.map((p, idx) => (
//                 <div
//                   key={idx}
//                   className="p-3 bg-gray-50 rounded mb-2 flex justify-between items-center"
//                 >
//                   <div>
//                     <div className="font-medium">{p.ticketName}</div>
//                     <div className="text-sm text-gray-600">
//                       {p.ticketPrice.toLocaleString()} VND
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => {
//                         setNewPrice(p);
//                         setPrices(prices.filter((_, i) => i !== idx));
//                       }}
//                     >
//                       Sửa
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => setPrices(prices.filter((_, i) => i !== idx))}
//                     >
//                       Xóa
//                     </Button>
//                   </div>
//                 </div>
//               ))}

//               {/* Add Price Form */}
//               <div className="mt-4 space-y-3 border-t pt-3">
//                 <FormInput
//                   label="Tên vé"
//                   name="ticketName"
//                   value={newPrice.ticketName}
//                   onChange={(val) => setNewPrice({ ...newPrice, ticketName: val })}
//                 />
//                 <FormInput
//                   label="Mô tả"
//                   name="ticketDescription"
//                   value={newPrice.ticketDescription}
//                   onChange={(val) => setNewPrice({ ...newPrice, ticketDescription: val })}
//                 />
//                 <div className="grid grid-cols-2 gap-3">
//                   <FormInput
//                     label="Giá bán"
//                     name="ticketPrice"
//                     type="number"
//                     value={newPrice.ticketPrice}
//                     onChange={(val) => setNewPrice({ ...newPrice, ticketPrice: Number(val) })}
//                   />
//                 </div>
//                 <Button onClick={handleAddPrice}>Thêm vé</Button>
//               </div>
//             </div>

//             {/* Price Phase */}
//             <div className="border p-4 rounded">
//               <h4 className="font-medium mb-3">Giai đoạn giá</h4>
//               <div className="space-y-3">
//                 <div className="grid grid-cols-2 gap-3">
//                   <FormInput
//                     label="Early bird kết thúc"
//                     name="earlierBirdEndInterval"
//                     type="date"
//                     value={pricePhase.earlierBirdEndInterval}
//                     onChange={(val) =>
//                       setPricePhase({ ...pricePhase, earlierBirdEndInterval: val })
//                     }
//                   />
//                   <FormInput
//                     label="% giảm early"
//                     name="percentForEarly"
//                     type="number"
//                     value={pricePhase.percentForEarly}
//                     onChange={(val) =>
//                       setPricePhase({ ...pricePhase, percentForEarly: Number(val) })
//                     }
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <FormInput
//                     label="Standard kết thúc"
//                     name="standardEndInterval"
//                     type="date"
//                     value={pricePhase.standardEndInterval}
//                     onChange={(val) =>
//                       setPricePhase({ ...pricePhase, standardEndInterval: val })
//                     }
//                   />
//                   <FormInput
//                     label="Late kết thúc"
//                     name="lateEndInterval"
//                     type="date"
//                     value={pricePhase.lateEndInterval}
//                     onChange={(val) => setPricePhase({ ...pricePhase, lateEndInterval: val })}
//                   />
//                 </div>
//                 <FormInput
//                   label="% tăng late"
//                   name="percentForEnd"
//                   type="number"
//                   value={pricePhase.percentForEnd}
//                   onChange={(val) => setPricePhase({ ...pricePhase, percentForEnd: Number(val) })}
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       case 3:

//   return (
//     <div className="space-y-4">
//       <h3 className="text-lg font-semibold">Phiên họp</h3>

//       {/* Sessions List */}
//       <div className="space-y-2">
//         {sessions.length === 0 ? (
//           <div className="p-3 bg-yellow-50 text-yellow-800 rounded">
//             Chưa có phiên họp nào. Thêm phiên họp mới bên dưới.
//           </div>
//         ) : (
//           sessions.map((s, idx) => (
//             <div
//               key={s.sessionId || idx}
//               className="p-3 bg-gray-50 rounded flex justify-between items-center"
//             >
//               <div>
//                 <div className="font-medium">{s.title || "Không có tiêu đề"}</div>
//                 <div className="text-sm text-gray-600">
//                   Diễn giả: {s.speaker?.name || "Chưa có diễn giả"}
//                 </div>
//                 {s.room && (
//                   <div className="text-xs text-gray-500">
//                     Phòng: {s.room.number} - {s.room.displayName}
//                   </div>
//                 )}
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => {
//                     setNewSession(s);
//                     setSessions(sessions.filter((_, i) => i !== idx));
//                   }}
//                 >
//                   Sửa
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="destructive"
//                   onClick={() => setSessions(sessions.filter((_, i) => i !== idx))}
//                 >
//                   Xóa
//                 </Button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Add Session Form */}
//       <div className="border p-4 rounded space-y-3">
//         <h4 className="font-medium">Thêm phiên mới</h4>
//         <FormInput
//           label="Tiêu đề"
//           name="title"
//           value={newSession.title}
//           onChange={(val) => setNewSession({ ...newSession, title: val })}
//         />
//         <FormTextArea
//           label="Mô tả"
//           name="description"
//           value={newSession.description || ""}
//           onChange={(val) => setNewSession({ ...newSession, description: val })}
//           rows={2}
//         />
//         <div className="grid grid-cols-2 gap-3">
//           <FormInput
//             label="Thời gian bắt đầu"
//             name="startTime"
//             type="datetime-local"
//             value={newSession.startTime}
//             onChange={(val) => setNewSession({ ...newSession, startTime: val })}
//           />
//           <FormInput
//             label="Thời gian kết thúc"
//             name="endTime"
//             type="datetime-local"
//             value={newSession.endTime}
//             onChange={(val) => setNewSession({ ...newSession, endTime: val })}
//           />
//         </div>
//         <FormSelect
//           label="Phòng"
//           name="roomId"
//           value={newSession.roomId}
//           onChange={(val) => setNewSession({ ...newSession, roomId: val })}
//           options={roomOptions}
//           required
//           disabled={isRoomsLoading}
//         />
//         <div className="border-t pt-3">
//           <h5 className="font-medium mb-2">Diễn giả</h5>
//           <FormInput
//             label="Tên"
//             name="speakerName"
//             value={newSession.speaker?.name || ""}
//             onChange={(val) =>
//               setNewSession({
//                 ...newSession,
//                 speaker: { 
//                   ...(newSession.speaker || { name: "", description: "" }), 
//                   name: val 
//                 },
//               })
//             }
//           />
//           <FormTextArea
//             label="Mô tả"
//             value={newSession.speaker?.description || ""}
//             onChange={(val) =>
//               setNewSession({
//                 ...newSession,
//                 speaker: { 
//                   ...(newSession.speaker || { name: "", description: "" }), 
//                   description: val 
//                 },
//               })
//             }
//             rows={2}
//           />
//         </div>
//         <Button onClick={handleAddSession}>Thêm phiên</Button>
//       </div>
//     </div>
//   );

//       case 4:

//   return (
//     <div className="space-y-4">
//       <h3 className="text-lg font-semibold">Chính sách</h3>

//       {/* Policies List */}
//       <div className="space-y-2">
//         {policies.length === 0 ? (
//           <div className="p-3 bg-yellow-50 text-yellow-800 rounded">
//             Chưa có chính sách nào. Thêm chính sách mới bên dưới.
//           </div>
//         ) : (
//           policies.map((p, idx) => (
//             <div
//               key={idx}
//               className="p-3 bg-gray-50 rounded flex justify-between items-center"
//             >
//               <div>
//                 <div className="font-medium">{p.policyName || "Không có tên"}</div>
//                 <div className="text-sm text-gray-600">{p.description || "Không có mô tả"}</div>
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => {
//                     setNewPolicy(p);
//                     setPolicies(policies.filter((_, i) => i !== idx));
//                   }}
//                 >
//                   Sửa
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="destructive"
//                   onClick={() => setPolicies(policies.filter((_, i) => i !== idx))}
//                 >
//                   Xóa
//                 </Button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Add Policy Form */}
//       <div className="border p-4 rounded space-y-3">
//         <h4 className="font-medium">Thêm chính sách</h4>
//         <FormInput
//           label="Tên chính sách"
//           name="policyName"
//           value={newPolicy.policyName}
//           onChange={(val) => setNewPolicy({ ...newPolicy, policyName: val })}
//         />
//         <FormTextArea
//           label="Mô tả"
//           value={newPolicy.description || ""}
//           onChange={(val) => setNewPolicy({ ...newPolicy, description: val })}
//           rows={3}
//         />
//         <Button onClick={handleAddPolicy}>Thêm chính sách</Button>
//       </div>
//     </div>
//   );
//       case 5:
//         return (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Media</h3>

//             {/* Media List */}
//             <div className="space-y-2">
//               {mediaList.map((m, idx) => (
//                 <div key={idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
//                   <div className="flex items-center gap-3">
//                     {typeof m.mediaFile === "string" && m.mediaFile && (
//                       <img
//                         src={m.mediaFile}
//                         alt="Media"
//                         className="h-16 w-16 object-cover rounded"
//                       />
//                     )}
//                     <div className="text-sm">
//                       {typeof m.mediaFile === "string"
//                         ? m.mediaFile
//                         : m.mediaFile instanceof File
//                         ? m.mediaFile.name
//                         : "No file"}
//                     </div>
//                   </div>
//                   <Button
//                     size="sm"
//                     variant="destructive"
//                     onClick={() => setMediaList(mediaList.filter((_, i) => i !== idx))}
//                   >
//                     Xóa
//                   </Button>
//                 </div>
//               ))}
//             </div>

//             {/* Add Media Form */}
//             <div className="border p-4 rounded space-y-3">
//               <h4 className="font-medium">Thêm media</h4>
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Media File <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="file"
//                   onChange={(e) =>
//                     setNewMedia({
//                       ...newMedia,
//                       mediaFile: e.target.files?.[0] || null,
//                     })
//                   }
//                   accept="image/*,video/*"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <Button onClick={handleAddMedia}>Thêm media</Button>
//             </div>
//           </div>
//         );

//       case 6:
//         return (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Nhà tài trợ</h3>

//             {/* Sponsors List */}
//             <div className="space-y-2">
//               {sponsors.map((s, idx) => (
//                 <div
//                   key={idx}
//                   className="p-3 bg-gray-50 rounded flex justify-between items-center"
//                 >
//                   <div className="flex items-center gap-3">
//                     {typeof s.imageFile === "string" && s.imageFile && (
//                       <img
//                         src={s.imageFile}
//                         alt={s.name}
//                         className="h-16 w-16 object-cover rounded"
//                       />
//                     )}
//                     <div>
//                       <div className="font-medium">{s.name}</div>
//                       <div className="text-sm text-gray-600">
//                         {typeof s.imageFile === "string"
//                           ? "Logo hiện tại"
//                           : s.imageFile instanceof File
//                           ? s.imageFile.name
//                           : "No image"}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => {
//                         setNewSponsor(s);
//                         setSponsors(sponsors.filter((_, i) => i !== idx));
//                       }}
//                     >
//                       Sửa
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => setSponsors(sponsors.filter((_, i) => i !== idx))}
//                     >
//                       Xóa
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Add Sponsor Form */}
//             <div className="border p-4 rounded space-y-3">
//               <h4 className="font-medium">Thêm nhà tài trợ</h4>
//               <FormInput
//                 label="Tên"
//                 name="name"
//                 value={newSponsor.name}
//                 onChange={(val) => setNewSponsor({ ...newSponsor, name: val })}
//               />
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Logo Nhà tài trợ <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="file"
//                   onChange={(e) =>
//                     setNewSponsor({
//                       ...newSponsor,
//                       imageFile: e.target.files?.[0] || null,
//                     })
//                   }
//                   accept="image/*"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <Button onClick={handleAddSponsor}>Thêm nhà tài trợ</Button>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   const handleNext = () => {
//     switch (currentStep) {
//       case 1:
//         handleBasicSubmit();
//         break;
//       case 2:
//         handlePriceSubmit();
//         break;
//       case 3:
//         handleSessionSubmit();
//         break;
//       case 4:
//         handlePolicySubmit();
//         break;
//       case 5:
//         handleMediaSubmit();
//         break;
//       case 6:
//         handleSponsorSubmit();
//         break;
//     }
//   };

//   const isLoading =
//     isCreatingBasic ||
//     isUpdatingBasic ||
//     isCreatingPrice ||
//     isUpdatingPrice ||
//     isCreatingSessions ||
//     isUpdatingSessions ||
//     isUpdatingSpeaker ||
//     isCreatingPolicies ||
//     isUpdatingPolicies ||
//     isCreatingMedia ||
//     isUpdatingMedia ||
//     isCreatingSponsors ||
//     isUpdatingSponsors;

//   const getButtonLabel = () => {
//     if (isLoading) return "Đang xử lý...";
//     if (currentStep === 6) {
//       return isEditMode ? "Lưu thay đổi" : "Hoàn thành";
//     }
//     return isEditMode ? "Lưu & Tiếp tục" : "Tiếp theo";
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       {/* Mode Indicator */}
//       {isEditMode && (
//         <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//           <p className="text-sm text-blue-800 font-medium">
//             🔧 Chế độ chỉnh sửa - Bạn có thể chọn bất kỳ bước nào để cập nhật
//           </p>
//         </div>
//       )}

//       {/* Step Indicator */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between">
//           {STEPS.map((step) => (
//             <div
//               key={step.id}
//               onClick={() => handleStepClick(step.id)}
//               className={`flex-1 text-center ${
//                 step.id === currentStep
//                   ? "text-blue-600 font-semibold"
//                   : "text-gray-400"
//               } ${isEditMode ? "cursor-pointer hover:text-blue-500" : ""}`}
//             >
//               <div
//                 className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${
//                   step.id === currentStep
//                     ? "bg-blue-600 text-white"
//                     : isEditMode
//                     ? "bg-gray-200 hover:bg-gray-300"
//                     : "bg-gray-200"
//                 }`}
//               >
//                 {step.id}
//               </div>
//               <div className="text-sm">{step.title}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Step Content */}
//       <div className="bg-white border rounded-lg p-6 mb-6">{renderStepContent()}</div>

//       {/* Navigation Buttons */}
//       <div className="flex justify-between">
//         <Button
//           onClick={() => dispatch(prevStep())}
//           disabled={currentStep === 1}
//           variant="outline"
//           className="px-6"
//         >
//           Quay lại
//         </Button>
//         <div className="flex gap-3">
//           {isEditMode && onCancel && (
//             <Button onClick={onCancel} variant="outline" className="px-6">
//               Hủy
//             </Button>
//           )}
//           <Button
//             onClick={handleNext}
//             disabled={isLoading}
//             className="px-6 bg-blue-600 text-white hover:bg-blue-700"
//           >
//             {getButtonLabel()}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }



// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { FormInput } from "@/components/molecules/FormInput";
// import { FormSelect } from "@/components/molecules/FormSelect";
// import { FormTextArea } from "@/components/molecules/FormTextArea";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
// import {
//   useCreateBasicConferenceMutation,
//   useUpdateBasicConferenceMutation,
//   useCreateConferencePriceMutation,
//   useUpdateConferencePriceMutation,
//   useCreateConferenceSessionsMutation,
//   useUpdateConferenceSessionMutation,
//   useUpdateConferenceSpeakerMutation,
//   useCreateConferencePoliciesMutation,
//   useUpdateConferencePolicyMutation,
//   useCreateConferenceMediaMutation,
//   useUpdateConferenceMediaMutation,
//   useCreateConferenceSponsorsMutation,
//   useUpdateConferenceSponsorMutation,
//   useGetBasicStepByIdQuery,
// } from "@/redux/services/conferenceStep.service";

// import { useGetAllCategoriesQuery } from "@/redux/services/category.service";
// import { useGetAllRoomsQuery } from "@/redux/services/room.service";

// import {
//   nextStep,
//   prevStep,
//   goToStep,
//   setConferenceId,
//   setMode,
//   resetWizard,
// } from "@/redux/slices/conferenceStep.slice";
// import type {
//   ConferenceBasicForm,
//   PricePhase,
//   Price,
//   Session,
//   Policy,
//   Media,
//   Sponsor,
//   ConferenceResponse,
// } from "@/types/conference.type";
// import { toast } from "sonner";

// const STEPS = [
//   { id: 1, title: "Thông tin cơ bản" },
//   { id: 2, title: "Giá vé" },
//   { id: 3, title: "Phiên họp" },
//   { id: 4, title: "Chính sách" },
//   { id: 5, title: "Media" },
//   { id: 6, title: "Nhà tài trợ" },
// ];

// interface ConferenceStepFormProps {
//   conference?: ConferenceResponse | null;
//   onSave?: (data: ConferenceResponse) => void;
//   onCancel?: () => void;
// }

// export function ConferenceStepForm({
//   conference,
//   onSave,
//   onCancel,
// }: ConferenceStepFormProps) {
//   const dispatch = useAppDispatch();
//   const { currentStep, conferenceId: reduxConferenceId, mode: reduxMode } = useAppSelector(
//     (state) => state.conferenceStep
//   );

//   // Detect mode
//   const isEditMode = reduxMode === 'edit' || !!conference;
//   const conferenceId = isEditMode ? conference?.conferenceId : reduxConferenceId;

//   // API Mutations - CREATE
//   const [createBasic, { isLoading: isCreatingBasic }] = useCreateBasicConferenceMutation();
//   const [createPrice, { isLoading: isCreatingPrice }] = useCreateConferencePriceMutation();
//   const [createSessions, { isLoading: isCreatingSessions }] = useCreateConferenceSessionsMutation();
//   const [createPolicies, { isLoading: isCreatingPolicies }] = useCreateConferencePoliciesMutation();
//   const [createMedia, { isLoading: isCreatingMedia }] = useCreateConferenceMediaMutation();
//   const [createSponsors, { isLoading: isCreatingSponsors }] = useCreateConferenceSponsorsMutation();

//   // API Mutations - UPDATE
//   const [updateBasic, { isLoading: isUpdatingBasic }] = useUpdateBasicConferenceMutation();
//   const [updatePrice, { isLoading: isUpdatingPrice }] = useUpdateConferencePriceMutation();
//   const [updateSessions, { isLoading: isUpdatingSessions }] = useUpdateConferenceSessionMutation();
//   const [updateSpeaker, { isLoading: isUpdatingSpeaker }] = useUpdateConferenceSpeakerMutation();
//   const [updatePolicies, { isLoading: isUpdatingPolicies }] = useUpdateConferencePolicyMutation();
//   const [updateMedia, { isLoading: isUpdatingMedia }] = useUpdateConferenceMediaMutation();
//   const [updateSponsors, { isLoading: isUpdatingSponsors }] = useUpdateConferenceSponsorMutation();

//   const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
//   const { data: roomsData, isLoading: isRoomsLoading } = useGetAllRoomsQuery();

//   const categoryOptions =
//     categoriesData?.data?.map((category) => ({
//       value: category.categoryId,
//       label: category.conferenceCategoryName,
//     })) || [];

//   const roomOptions =
//     roomsData?.data?.map((room) => ({
//       value: room.roomId,
//       label: `${room.number} - ${room.displayName} - ${room.destinationId}`,
//     })) || [];

//   // Step 1: Basic Info
//   const [basicForm, setBasicForm] = useState<ConferenceBasicForm>({
//     conferenceName: "",
//     description: "",
//     startDate: "",
//     endDate: "",
//     capacity: 0,
//     address: "",
//     bannerImageFile: null,
//     isInternalHosted: true,
//     isResearchConference: false,
//     categoryName: "",
//   });
//   const [existingBannerUrl, setExistingBannerUrl] = useState<string>("");

//   // Step 2: Price
//   const [pricePhase, setPricePhase] = useState<PricePhase>({
//     name: "",
//     earlierBirdEndInterval: "",
//     percentForEarly: 0,
//     standardEndInterval: "",
//     lateEndInterval: "",
//     percentForEnd: 0,
//   });
//   const [prices, setPrices] = useState<Price[]>([]);
//   const [newPrice, setNewPrice] = useState<Price>({
//     ticketPrice: 0,
//     ticketName: "",
//     ticketDescription: "",
//     actualPrice: 0,
//   });

//   // Step 3: Sessions
//   const [sessions, setSessions] = useState<Session[]>([]);
//   const [newSession, setNewSession] = useState<Session>({
//     title: "",
//     description: "",
//     startTime: "",
//     endTime: "",
//     roomId: "",
//     speaker: {
//       name: "",
//       description: "",
//     },
//   });

//   // Step 4: Policies
//   const [policies, setPolicies] = useState<Policy[]>([]);
//   const [newPolicy, setNewPolicy] = useState<Policy>({
//     policyName: "",
//     description: "",
//   });

//   // Step 5: Media
//   const [mediaList, setMediaList] = useState<Media[]>([]);
//   const [newMedia, setNewMedia] = useState<Media>({
//     mediaFile: "",
//   });

//   // Step 6: Sponsors
//   const [sponsors, setSponsors] = useState<Sponsor[]>([]);
//   const [newSponsor, setNewSponsor] = useState<Sponsor>({
//     name: "",
//     imageFile: "",
//   });

//   // Load data in edit mode
//   useEffect(() => {
//     if (isEditMode && conference) {
//       dispatch(setMode('edit'));
//       dispatch(setConferenceId(conference.conferenceId));
//       loadConferenceData(conference);
//     } else {
//       dispatch(setMode('create'));
//     }
//   }, [isEditMode, conference, dispatch]);

//   const loadConferenceData = (conf: ConferenceResponse) => {
//     // Step 1: Basic Info
//     setBasicForm({
//       conferenceName: conf.conferenceName || "",
//       description: conf.description || "",
//       startDate: conf.startDate ? conf.startDate.split("T")[0] : "",
//       endDate: conf.endDate ? conf.endDate.split("T")[0] : "",
//       capacity: conf.capacity || 0,
//       address: conf.address || "",
//       bannerImageFile: null,
//       isInternalHosted: conf.isInternalHosted ?? true,
//       isResearchConference: conf.isResearchConference ?? false,
//       categoryName: conf.categoryId || "",
//     });
//     setExistingBannerUrl(conf.bannerImageUrl || "");

//     // Step 2: Prices
//     if (conf.prices && conf.prices.length > 0) {
//       const transformedPrices: Price[] = conf.prices.map((p) => ({
//         priceId: p.priceId,
//         ticketPrice: p.ticketPrice ?? 0,
//         ticketName: p.ticketName ?? "",
//         ticketDescription: p.ticketDescription ?? "",
//         actualPrice: p.actualPrice ?? 0,
//         currentPhase: p.currentPhase,
//         pricePhaseId: p.pricePhaseId,
//       }));
//       setPrices(transformedPrices);
//     }

//     // Step 3: Sessions
//     if (conf.sessions && conf.sessions.length > 0) {
//       const transformedSessions: Session[] = conf.sessions.map((s) => ({
//         sessionId: s.sessionId,
//         title: s.title ?? "",
//         description: s.description ?? "",
//         startTime: s.startTime ? s.startTime.slice(0, 16) : "",
//         endTime: s.endTime ? s.endTime.slice(0, 16) : "",
//         roomId: s.roomId ?? "",
//         room: s.room,
//         speaker: {
//           name: s.speaker?.name ?? "",
//           description: s.speaker?.description ?? "",
//         },
//       }));
//       setSessions(transformedSessions);
//     }

//     // Step 4: Policies
//     if (conf.policies && conf.policies.length > 0) {
//       const transformedPolicies: Policy[] = conf.policies.map((p) => ({
//         policyName: p.policyName ?? "",
//         description: p.description ?? "",
//       }));
//       setPolicies(transformedPolicies);
//     }

//     // Step 5: Media
//     if (conf.media && conf.media.length > 0) {
//       const transformedMedia: Media[] = conf.media.map((m) => ({
//         mediaFile: m.mediaUrl ?? "",
//       }));
//       setMediaList(transformedMedia);
//     }

//     // Step 6: Sponsors
//     if (conf.sponsors && conf.sponsors.length > 0) {
//       const transformedSponsors: Sponsor[] = conf.sponsors.map((s) => ({
//         name: s.name ?? "",
//         imageFile: s.imageUrl ?? "",
//       }));
//       setSponsors(transformedSponsors);
//     }
//   };

//   // ============================================
//   // VALIDATION FUNCTIONS
//   // ============================================
//   const validateStep = (step: number): boolean => {
//     switch (step) {
//       case 1:
//         if (!basicForm.conferenceName.trim()) {
//           toast.error("Vui lòng nhập tên hội thảo!");
//           return false;
//         }
//         if (!basicForm.startDate || !basicForm.endDate) {
//           toast.error("Vui lòng chọn ngày bắt đầu và kết thúc!");
//           return false;
//         }
//         if (!basicForm.categoryName) {
//           toast.error("Vui lòng chọn danh mục!");
//           return false;
//         }
//         return true;

//       case 2:
//         // Optional: Validate prices if needed
//         return true;

//       case 3:
//         // Optional: Validate sessions if needed
//         return true;

//       case 4:
//         // Optional: Validate policies if needed
//         return true;

//       case 5:
//         // Optional: Validate media if needed
//         return true;

//       case 6:
//         return true;

//       default:
//         return true;
//     }
//   };

//   // ============================================
//   // CREATE MODE - Handle Step Submit (GỌI API MỖI STEP)
//   // ============================================
//   const handleBasicSubmitCreate = async () => {
//     try {
//       const result = await createBasic(basicForm).unwrap();
//       const confId = result.data.conferenceId;
//       dispatch(setConferenceId(confId));
//       toast.success("Tạo thông tin cơ bản thành công!");
//       dispatch(nextStep());
//     } catch (error) {
//       console.error("Failed to create basic info:", error);
//       toast.error("Tạo mới thất bại!");
//     }
//   };

//   const handlePriceSubmitCreate = async () => {
//     if (!conferenceId) return;
//     try {
//       const data = { pricePhase, prices };
//       await createPrice({ conferenceId, data }).unwrap();
//       toast.success("Tạo giá vé thành công!");
//       dispatch(nextStep());
//     } catch (error) {
//       console.error("Failed to create price:", error);
//       toast.error("Tạo giá vé thất bại!");
//     }
//   };

//   const handleSessionSubmitCreate = async () => {
//     if (!conferenceId) return;
//     try {
//       const formattedSessions = sessions.map((s) => ({
//         title: s.title,
//         description: s.description,
//         startTime: new Date(s.startTime).toISOString(),
//         endTime: new Date(s.endTime).toISOString(),
//         roomId: s.roomId,
//         speaker: {
//           name: s.speaker?.name || "",
//           description: s.speaker?.description || "",
//         },
//       }));

//       const data = { sessions: formattedSessions };
//       await createSessions({ conferenceId, data }).unwrap();
//       toast.success("Tạo phiên họp thành công!");
//       dispatch(nextStep());
//     } catch (error) {
//       console.error("Failed to create sessions:", error);
//       toast.error("Tạo phiên họp thất bại!");
//     }
//   };

//   const handlePolicySubmitCreate = async () => {
//     if (!conferenceId) return;
//     try {
//       const data = { policies };
//       await createPolicies({ conferenceId, data }).unwrap();
//       toast.success("Tạo chính sách thành công!");
//       dispatch(nextStep());
//     } catch (error) {
//       console.error("Failed to create policies:", error);
//       toast.error("Tạo chính sách thất bại!");
//     }
//   };

//   const handleMediaSubmitCreate = async () => {
//     if (!conferenceId) return;
//     try {
//       const data = { media: mediaList };
//       await createMedia({ conferenceId, data }).unwrap();
//       toast.success("Tạo media thành công!");
//       dispatch(nextStep());
//     } catch (error) {
//       console.error("Failed to create media:", error);
//       toast.error("Tạo media thất bại!");
//     }
//   };

//   const handleSponsorSubmitCreate = async () => {
//     if (!conferenceId) return;
//     try {
//       const data = { sponsors };
//       await createSponsors({ conferenceId, data }).unwrap();
//       toast.success("Tạo hội thảo thành công!");
//       dispatch(resetWizard());
//       if (onCancel) onCancel();
//     } catch (error) {
//       console.error("Failed to create sponsors:", error);
//       toast.error("Tạo nhà tài trợ thất bại!");
//     }
//   };

//   // ============================================
//   // EDIT MODE - Save All Changes at Step 6
//   // ============================================
//   const handleSaveAllChanges = async () => {
//     if (!conferenceId) {
//       toast.error("Không tìm thấy ID hội thảo!");
//       return;
//     }

//     try {
//       // Format sessions data
//       const formattedSessions = sessions.map((s) => ({
//         title: s.title,
//         description: s.description,
//         startTime: new Date(s.startTime).toISOString(),
//         endTime: new Date(s.endTime).toISOString(),
//         roomId: s.roomId,
//         speaker: {
//           name: s.speaker?.name || "",
//           description: s.speaker?.description || "",
//         },
//       }));

//       // Gọi TẤT CẢ API update cùng lúc
//       await Promise.all([
//         updateBasic({ conferenceId, data: basicForm }).unwrap(),
//         updatePrice({ conferenceId, data: { pricePhase, prices } }).unwrap(),
//         updateSessions({ conferenceId, data: { sessions: formattedSessions } }).unwrap(),
//         updatePolicies({ conferenceId, data: { policies } }).unwrap(),
//         updateMedia({ conferenceId, data: { media: mediaList } }).unwrap(),
//         updateSponsors({ conferenceId, data: { sponsors } }).unwrap(),
//       ]);

//       // Update speakers separately (if any)
//       const speakerUpdatePromises = sessions
//         .filter(s => s.sessionId && s.speaker)
//         .map(s => {
//           const speakerData = {
//             speaker: { 
//               name: s.speaker?.name || "",
//               description: s.speaker?.description || "",
//             },
//           };
//           return updateSpeaker({
//             sessionId: s.sessionId!,
//             data: speakerData, 
//           }).unwrap();
//         });
      
//       if (speakerUpdatePromises.length > 0) {
//         await Promise.all(speakerUpdatePromises);
//       }

//       toast.success("Cập nhật tất cả thông tin thành công! 🎉");
      
//       if (onSave && conference) {
//         onSave(conference);
//       }
      
//       if (onCancel) {
//         onCancel();
//       }
//     } catch (error) {
//       console.error("Failed to save all changes:", error);
//       toast.error("Có lỗi xảy ra khi cập nhật! Vui lòng thử lại.");
//     }
//   };

//   // ============================================
//   // NAVIGATION HANDLER
//   // ============================================
//   const handleNext = () => {
//     // Validate current step
//     if (!validateStep(currentStep)) {
//       return;
//     }

//     if (isEditMode) {
//       // EDIT MODE: Chỉ chuyển step, KHÔNG gọi API
//       if (currentStep === 6) {
//         // Step 6 thì gọi save all
//         handleSaveAllChanges();
//       } else {
//         dispatch(nextStep());
//       }
//     } else {
//       // CREATE MODE: Gọi API từng step như cũ
//       switch (currentStep) {
//         case 1:
//           handleBasicSubmitCreate();
//           break;
//         case 2:
//           handlePriceSubmitCreate();
//           break;
//         case 3:
//           handleSessionSubmitCreate();
//           break;
//         case 4:
//           handlePolicySubmitCreate();
//           break;
//         case 5:
//           handleMediaSubmitCreate();
//           break;
//         case 6:
//           handleSponsorSubmitCreate();
//           break;
//       }
//     }
//   };

//   // Add handlers
//   const handleAddPrice = () => {
//     if (!newPrice.ticketName || !newPrice.ticketPrice) return;
//     setPrices([...prices, newPrice]);
//     setNewPrice({
//       ticketPrice: 0,
//       ticketName: "",
//       ticketDescription: "",
//       actualPrice: 0,
//     });
//   };

//   const handleAddSession = () => {
//     if (!newSession.title || !newSession.speaker?.name) return;
//     setSessions([...sessions, newSession]);
//     setNewSession({
//       title: "",
//       description: "",
//       startTime: "",
//       endTime: "",
//       roomId: "",
//       speaker: { name: "", description: "" },
//     });
//   };

//   const handleAddPolicy = () => {
//     if (!newPolicy.policyName) return;
//     setPolicies([...policies, newPolicy]);
//     setNewPolicy({ policyName: "", description: "" });
//   };

//   const handleAddMedia = () => {
//     if (!newMedia.mediaFile) return;
//     setMediaList([...mediaList, newMedia]);
//     setNewMedia({ mediaFile: "" });
//   };

//   const handleAddSponsor = () => {
//     if (!newSponsor.name) return;
//     setSponsors([...sponsors, newSponsor]);
//     setNewSponsor({ name: "", imageFile: "" });
//   };

//   // Navigation handler for edit mode
//   const handleStepClick = (stepId: number) => {
//     if (isEditMode) {
//       dispatch(goToStep(stepId));
//     }
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
//             <FormInput
//               label="Tên hội thảo"
//               name="conferenceName"
//               value={basicForm.conferenceName}
//               onChange={(val) => setBasicForm({ ...basicForm, conferenceName: val })}
//               required
//             />
//             <FormTextArea
//               label="Mô tả"
//               value={basicForm.description ?? ""}
//               onChange={(val) => setBasicForm({ ...basicForm, description: val })}
//               rows={3}
//             />
//             <div className="grid grid-cols-2 gap-4">
//               <FormInput
//                 label="Ngày bắt đầu"
//                 name="startDate"
//                 type="date"
//                 value={basicForm.startDate}
//                 onChange={(val) => setBasicForm({ ...basicForm, startDate: val })}
//                 required
//               />
//               <FormInput
//                 label="Ngày kết thúc"
//                 name="endDate"
//                 type="date"
//                 value={basicForm.endDate}
//                 onChange={(val) => setBasicForm({ ...basicForm, endDate: val })}
//                 required
//               />
//             </div>
//             <FormInput
//               label="Sức chứa"
//               name="capacity"
//               type="number"
//               value={basicForm.capacity}
//               onChange={(val) => setBasicForm({ ...basicForm, capacity: Number(val) })}
//             />
//             <FormInput
//               label="Địa chỉ"
//               name="address"
//               value={basicForm.address}
//               onChange={(val) => setBasicForm({ ...basicForm, address: val })}
//             />
//             <FormSelect
//               label="Danh mục"
//               name="categoryId"
//               value={basicForm.categoryName}
//               onChange={(val) => setBasicForm({ ...basicForm, categoryName: val })}
//               options={categoryOptions}
//               required
//               disabled={isCategoriesLoading}
//             />
//             <div>
//               <label className="block text-sm font-medium mb-2">Banner Image</label>
//               {isEditMode && existingBannerUrl && !basicForm.bannerImageFile && (
//                 <div className="mb-2">
//                   <img
//                     src={existingBannerUrl}
//                     alt="Current banner"
//                     className="h-32 w-auto object-cover rounded border"
//                   />
//                   <p className="text-sm text-gray-500 mt-1">
//                     Banner hiện tại (upload file mới để thay đổi)
//                   </p>
//                 </div>
//               )}
//               <input
//                 type="file"
//                 onChange={(e) =>
//                   setBasicForm({
//                     ...basicForm,
//                     bannerImageFile: e.target.files?.[0] || null,
//                   })
//                 }
//                 accept="image/*"
//               />
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Giá vé</h3>
//             {/* Prices List */}
//             <div className="border p-4 rounded">
//               <h4 className="font-medium mb-3">Danh sách vé ({prices.length})</h4>
//               {prices.map((p, idx) => (
//                 <div
//                   key={idx}
//                   className="p-3 bg-gray-50 rounded mb-2 flex justify-between items-center"
//                 >
//                   <div>
//                     <div className="font-medium">{p.ticketName}</div>
//                     <div className="text-sm text-gray-600">
//                       {p.ticketPrice.toLocaleString()} VND
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => {
//                         setNewPrice(p);
//                         setPrices(prices.filter((_, i) => i !== idx));
//                       }}
//                     >
//                       Sửa
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => setPrices(prices.filter((_, i) => i !== idx))}
//                     >
//                       Xóa
//                     </Button>
//                   </div>
//                 </div>
//               ))}

//               {/* Add Price Form */}
//               <div className="mt-4 space-y-3 border-t pt-3">
//                 <FormInput
//                   label="Tên vé"
//                   name="ticketName"
//                   value={newPrice.ticketName}
//                   onChange={(val) => setNewPrice({ ...newPrice, ticketName: val })}
//                 />
//                 <FormInput
//                   label="Mô tả"
//                   name="ticketDescription"
//                   value={newPrice.ticketDescription}
//                   onChange={(val) => setNewPrice({ ...newPrice, ticketDescription: val })}
//                 />
//                 <div className="grid grid-cols-2 gap-3">
//                   <FormInput
//                     label="Giá bán"
//                     name="ticketPrice"
//                     type="number"
//                     value={newPrice.ticketPrice}
//                     onChange={(val) => setNewPrice({ ...newPrice, ticketPrice: Number(val) })}
//                   />
//                 </div>
//                 <Button onClick={handleAddPrice}>Thêm vé</Button>
//               </div>
//             </div>

//             {/* Price Phase */}
//             <div className="border p-4 rounded">
//               <h4 className="font-medium mb-3">Giai đoạn giá</h4>
//               <div className="space-y-3">
//                 <div className="grid grid-cols-2 gap-3">
//                   <FormInput
//                     label="Early bird kết thúc"
//                     name="earlierBirdEndInterval"
//                     type="date"
//                     value={pricePhase.earlierBirdEndInterval}
//                     onChange={(val) =>
//                       setPricePhase({ ...pricePhase, earlierBirdEndInterval: val })
//                     }
//                   />
//                   <FormInput
//                     label="% giảm early"
//                     name="percentForEarly"
//                     type="number"
//                     value={pricePhase.percentForEarly}
//                     onChange={(val) =>
//                       setPricePhase({ ...pricePhase, percentForEarly: Number(val) })
//                     }
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <FormInput
//                     label="Standard kết thúc"
//                     name="standardEndInterval"
//                     type="date"
//                     value={pricePhase.standardEndInterval}
//                     onChange={(val) =>
//                       setPricePhase({ ...pricePhase, standardEndInterval: val })
//                     }
//                   />
//                   <FormInput
//                     label="Late kết thúc"
//                     name="lateEndInterval"
//                     type="date"
//                     value={pricePhase.lateEndInterval}
//                     onChange={(val) => setPricePhase({ ...pricePhase, lateEndInterval: val })}
//                   />
//                 </div>
//                 <FormInput
//                   label="% tăng late"
//                   name="percentForEnd"
//                   type="number"
//                   value={pricePhase.percentForEnd}
//                   onChange={(val) => setPricePhase({ ...pricePhase, percentForEnd: Number(val) })}
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Phiên họp</h3>

//             {/* Sessions List */}
//             <div className="space-y-2">
//               {sessions.length === 0 ? (
//                 <div className="p-3 bg-yellow-50 text-yellow-800 rounded">
//                   Chưa có phiên họp nào. Thêm phiên họp mới bên dưới.
//                 </div>
//               ) : (
//                 sessions.map((s, idx) => (
//                   <div
//                     key={s.sessionId || idx}
//                     className="p-3 bg-gray-50 rounded flex justify-between items-center"
//                   >
//                     <div>
//                       <div className="font-medium">{s.title || "Không có tiêu đề"}</div>
//                       <div className="text-sm text-gray-600">
//                         Diễn giả: {s.speaker?.name || "Chưa có diễn giả"}
//                       </div>
//                       {s.room && (
//                         <div className="text-xs text-gray-500">
//                           Phòng: {s.room.number} - {s.room.displayName}
//                         </div>
//                       )}
//                     </div>
//                     <div className="flex gap-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => {
//                           setNewSession(s);
//                           setSessions(sessions.filter((_, i) => i !== idx));
//                         }}
//                       >
//                         Sửa
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="destructive"
//                         onClick={() => setSessions(sessions.filter((_, i) => i !== idx))}
//                       >
//                         Xóa
//                       </Button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>

//             {/* Add Session Form */}
//             <div className="border p-4 rounded space-y-3">
//               <h4 className="font-medium">Thêm phiên mới</h4>
//               <FormInput
//                 label="Tiêu đề"
//                 name="title"
//                 value={newSession.title}
//                 onChange={(val) => setNewSession({ ...newSession, title: val })}
//               />
//               <FormTextArea
//                 label="Mô tả"
//                 name="description"
//                 value={newSession.description || ""}
//                 onChange={(val) => setNewSession({ ...newSession, description: val })}
//                 rows={2}
//               />
//               <div className="grid grid-cols-2 gap-3">
//                 <FormInput
//                   label="Thời gian bắt đầu"
//                   name="startTime"
//                   type="datetime-local"
//                   value={newSession.startTime}
//                   onChange={(val) => setNewSession({ ...newSession, startTime: val })}
//                 />
//                 <FormInput
//                   label="Thời gian kết thúc"
//                   name="endTime"
//                   type="datetime-local"
//                   value={newSession.endTime}
//                   onChange={(val) => setNewSession({ ...newSession, endTime: val })}
//                 />
//               </div>
//               <FormSelect
//                 label="Phòng"
//                 name="roomId"
//                 value={newSession.roomId}
//                 onChange={(val) => setNewSession({ ...newSession, roomId: val })}
//                 options={roomOptions}
//                 required
//                 disabled={isRoomsLoading}
//               />
//               <div className="border-t pt-3">
//                 <h5 className="font-medium mb-2">Diễn giả</h5>
//                 <FormInput
//                   label="Tên"
//                   name="speakerName"
//                   value={newSession.speaker?.name || ""}
//                   onChange={(val) =>
//                     setNewSession({
//                       ...newSession,
//                       speaker: { 
//                         ...(newSession.speaker || { name: "", description: "" }), 
//                         name: val 
//                       },
//                     })
//                   }
//                 />
//                 <FormTextArea
//                   label="Mô tả"
//                   value={newSession.speaker?.description || ""}
//                   onChange={(val) =>
//                     setNewSession({
//                       ...newSession,
//                       speaker: { 
//                         ...(newSession.speaker || { name: "", description: "" }), 
//                         description: val 
//                       },
//                     })
//                   }
//                   rows={2}
//                 />
//               </div>
//               <Button onClick={handleAddSession}>Thêm phiên</Button>
//             </div>
//           </div>
//         );

//       case 4:
//         return (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Chính sách</h3>

//             {/* Policies List */}
//             <div className="space-y-2">
//               {policies.length === 0 ? (
//                 <div className="p-3 bg-yellow-50 text-yellow-800 rounded">
//                   Chưa có chính sách nào. Thêm chính sách mới bên dưới.
//                 </div>
//               ) : (
//                 policies.map((p, idx) => (
//                   <div
//                     key={idx}
//                     className="p-3 bg-gray-50 rounded flex justify-between items-center"
//                   >
//                     <div>
//                       <div className="font-medium">{p.policyName || "Không có tên"}</div>
//                       <div className="text-sm text-gray-600">{p.description || "Không có mô tả"}</div>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => {
//                           setNewPolicy(p);
//                           setPolicies(policies.filter((_, i) => i !== idx));
//                         }}
//                       >
//                         Sửa
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="destructive"
//                         onClick={() => setPolicies(policies.filter((_, i) => i !== idx))}
//                       >
//                         Xóa
//                       </Button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>

//             {/* Add Policy Form */}
//             <div className="border p-4 rounded space-y-3">
//               <h4 className="font-medium">Thêm chính sách</h4>
//               <FormInput
//                 label="Tên chính sách"
//                 name="policyName"
//                 value={newPolicy.policyName}
//                 onChange={(val) => setNewPolicy({ ...newPolicy, policyName: val })}
//               />
//               <FormTextArea
//                 label="Mô tả"
//                 value={newPolicy.description || ""}
//                 onChange={(val) => setNewPolicy({ ...newPolicy, description: val })}
//                 rows={3}
//               />
//               <Button onClick={handleAddPolicy}>Thêm chính sách</Button>
//             </div>
//           </div>
//         );

//       case 5:
//         return (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Media</h3>

//             {/* Media List */}
//             <div className="space-y-2">
//               {mediaList.map((m, idx) => (
//                 <div key={idx} className="p-3 bg-gray-50 rounded flex justify-between items-center">
//                   <div className="flex items-center gap-3">
//                     {typeof m.mediaFile === "string" && m.mediaFile && (
//                       <img
//                         src={m.mediaFile}
//                         alt="Media"
//                         className="h-16 w-16 object-cover rounded"
//                       />
//                     )}
//                     <div className="text-sm">
//                       {typeof m.mediaFile === "string"
//                         ? m.mediaFile
//                         : m.mediaFile instanceof File
//                         ? m.mediaFile.name
//                         : "No file"}
//                     </div>
//                   </div>
//                   <Button
//                     size="sm"
//                     variant="destructive"
//                     onClick={() => setMediaList(mediaList.filter((_, i) => i !== idx))}
//                   >
//                     Xóa
//                   </Button>
//                 </div>
//               ))}
//             </div>

//             {/* Add Media Form */}
//             <div className="border p-4 rounded space-y-3">
//               <h4 className="font-medium">Thêm media</h4>
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Media File <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="file"
//                   onChange={(e) =>
//                     setNewMedia({
//                       ...newMedia,
//                       mediaFile: e.target.files?.[0] || null,
//                     })
//                   }
//                   accept="image/*,video/*"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <Button onClick={handleAddMedia}>Thêm media</Button>
//             </div>
//           </div>
//         );

//       case 6:
//         return (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Nhà tài trợ</h3>

//             {/* Sponsors List */}
//             <div className="space-y-2">
//               {sponsors.map((s, idx) => (
//                 <div
//                   key={idx}
//                   className="p-3 bg-gray-50 rounded flex justify-between items-center"
//                 >
//                   <div className="flex items-center gap-3">
//                     {typeof s.imageFile === "string" && s.imageFile && (
//                       <img
//                         src={s.imageFile}
//                         alt={s.name}
//                         className="h-16 w-16 object-cover rounded"
//                       />
//                     )}
//                     <div>
//                       <div className="font-medium">{s.name}</div>
//                       <div className="text-sm text-gray-600">
//                         {typeof s.imageFile === "string"
//                           ? "Logo hiện tại"
//                           : s.imageFile instanceof File
//                           ? s.imageFile.name
//                           : "No image"}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => {
//                         setNewSponsor(s);
//                         setSponsors(sponsors.filter((_, i) => i !== idx));
//                       }}
//                     >
//                       Sửa
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => setSponsors(sponsors.filter((_, i) => i !== idx))}
//                     >
//                       Xóa
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Add Sponsor Form */}
//             <div className="border p-4 rounded space-y-3">
//               <h4 className="font-medium">Thêm nhà tài trợ</h4>
//               <FormInput
//                 label="Tên"
//                 name="name"
//                 value={newSponsor.name}
//                 onChange={(val) => setNewSponsor({ ...newSponsor, name: val })}
//               />
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Logo Nhà tài trợ <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="file"
//                   onChange={(e) =>
//                     setNewSponsor({
//                       ...newSponsor,
//                       imageFile: e.target.files?.[0] || null,
//                     })
//                   }
//                   accept="image/*"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <Button onClick={handleAddSponsor}>Thêm nhà tài trợ</Button>
//             </div>

//             {/* Summary Section - Only in EDIT mode */}
//             {isEditMode && (
//               <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                 <h4 className="font-semibold text-blue-900 mb-2">📋 Tóm tắt thay đổi</h4>
//                 <ul className="text-sm text-blue-800 space-y-1">
//                   <li>✓ Thông tin cơ bản: {basicForm.conferenceName}</li>
//                   <li>✓ Số loại vé: {prices.length}</li>
//                   <li>✓ Số phiên họp: {sessions.length}</li>
//                   <li>✓ Số chính sách: {policies.length}</li>
//                   <li>✓ Số media: {mediaList.length}</li>
//                   <li>✓ Số nhà tài trợ: {sponsors.length}</li>
//                 </ul>
//                 <p className="text-xs text-blue-600 mt-3">
//                   Nhấn "Lưu tất cả thay đổi" để cập nhật toàn bộ thông tin
//                 </p>
//               </div>
//             )}
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   const isLoading =
//     isCreatingBasic ||
//     isUpdatingBasic ||
//     isCreatingPrice ||
//     isUpdatingPrice ||
//     isCreatingSessions ||
//     isUpdatingSessions ||
//     isUpdatingSpeaker ||
//     isCreatingPolicies ||
//     isUpdatingPolicies ||
//     isCreatingMedia ||
//     isUpdatingMedia ||
//     isCreatingSponsors ||
//     isUpdatingSponsors;

//   const getButtonLabel = () => {
//     if (isLoading) return "Đang xử lý...";
    
//     if (currentStep === 6) {
//       return isEditMode ? "💾 Lưu tất cả thay đổi" : "Hoàn thành";
//     }
    
//     return isEditMode ? "Tiếp theo ➔" : "Tiếp theo";
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       {/* Mode Indicator */}
//       {isEditMode && (
//         <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//           <p className="text-sm text-blue-800 font-medium">
//             🔧 Chế độ chỉnh sửa - Thay đổi sẽ được lưu khi bạn nhấn "Lưu tất cả thay đổi" ở bước cuối
//           </p>
//         </div>
//       )}

//       {/* Step Indicator */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between">
//           {STEPS.map((step) => (
//             <div
//               key={step.id}
//               onClick={() => handleStepClick(step.id)}
//               className={`flex-1 text-center ${
//                 step.id === currentStep
//                   ? "text-blue-600 font-semibold"
//                   : "text-gray-400"
//               } ${isEditMode ? "cursor-pointer hover:text-blue-500" : ""}`}
//             >
//               <div
//                 className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${
//                   step.id === currentStep
//                     ? "bg-blue-600 text-white"
//                     : isEditMode
//                     ? "bg-gray-200 hover:bg-gray-300"
//                     : "bg-gray-200"
//                 }`}
//               >
//                 {step.id}
//               </div>
//               <div className="text-sm">{step.title}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Step Content */}
//       <div className="bg-white border rounded-lg p-6 mb-6">{renderStepContent()}</div>

//       {/* Navigation Buttons */}
//       <div className="flex justify-between">
//         <Button
//           onClick={() => dispatch(prevStep())}
//           disabled={currentStep === 1}
//           variant="outline"
//           className="px-6"
//         >
//           ← Quay lại
//         </Button>
//         <div className="flex gap-3">
//           {isEditMode && onCancel && (
//             <Button onClick={onCancel} variant="outline" className="px-6">
//               Hủy
//             </Button>
//           )}
//           <Button
//             onClick={handleNext}
//             disabled={isLoading}
//             className="px-6 bg-blue-600 text-white hover:bg-blue-700"
//           >
//             {getButtonLabel()}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

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
  PricePhase,
  ConferenceResponse,

  Price,
  Session,
  Policy,
  Media,
  Sponsor,
  RoomInfoResponse
} from "@/types/conference.type";
import { toast } from "sonner";


const STEPS = [
  { id: 1, title: "Thông tin cơ bản" },
  { id: 2, title: "Giá vé" },
  { id: 3, title: "Phiên họp" },
  { id: 4, title: "Chính sách" },
  { id: 5, title: "Media" },
  { id: 6, title: "Nhà tài trợ" },
];

interface ConferenceStepFormProps {
  conference?: ConferenceResponse | null;
  onSave?: (data: ConferenceResponse) => void;
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
    capacity: 0,
    address: "",
    bannerImageFile: null,
    isInternalHosted: true,
    isResearchConference: false,
    categoryName: "",
  });
  const [existingBannerUrl, setExistingBannerUrl] = useState<string>("");

  // Step 2: Price
  const [pricePhase, setPricePhase] = useState<PricePhase>({
    name: "",
    earlierBirdEndInterval: "",
    percentForEarly: 0,
    standardEndInterval: "",
    lateEndInterval: "",
    percentForEnd: 0,
  });
  const [prices, setPrices] = useState<Price[]>([]);
  const [newPrice, setNewPrice] = useState<Price>({
    ticketPrice: 0,
    ticketName: "",
    ticketDescription: "",
    actualPrice: 0,
  });

  // Step 3: Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newSession, setNewSession] = useState<Session>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    roomId: "",
    speaker: {
      name: "",
      description: "",
    },
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

  const loadConferenceData = (conf: ConferenceResponse) => {
    // Step 1: Basic Info
    setBasicForm({
      conferenceName: conf.conferenceName || "",
      description: conf.description || "",
      startDate: conf.startDate ? conf.startDate.split("T")[0] : "",
      endDate: conf.endDate ? conf.endDate.split("T")[0] : "",
      capacity: conf.capacity || 0,
      address: conf.address || "",
      bannerImageFile: null,
      isInternalHosted: conf.isInternalHosted ?? true,
      isResearchConference: conf.isResearchConference ?? false,
      categoryName: conf.categoryId || "",
    });
    setExistingBannerUrl(conf.bannerImageUrl || "");

    // Step 2: Prices - INCLUDE priceId
    if (conf.prices && conf.prices.length > 0) {
      const transformedPrices: Price[] = conf.prices.map((p) => ({
        priceId: p.priceId, // ⬅️ KEEP ID
        ticketPrice: p.ticketPrice ?? 0,
        ticketName: p.ticketName ?? "",
        ticketDescription: p.ticketDescription ?? "",
        actualPrice: p.actualPrice ?? 0,
        currentPhase: p.currentPhase,
        pricePhaseId: p.pricePhaseId,
      }));
      setPrices(transformedPrices);
    }

    // Step 3: Sessions - INCLUDE sessionId
    if (conf.sessions && conf.sessions.length > 0) {
      const transformedSessions: Session[] = conf.sessions.map((s) => ({
        sessionId: s.sessionId, // ⬅️ KEEP ID
        title: s.title ?? "",
        description: s.description ?? "",
        startTime: s.startTime ? s.startTime.slice(0, 16) : "",
        endTime: s.endTime ? s.endTime.slice(0, 16) : "",
        roomId: s.roomId ?? "",
        room: s.room,
        speaker: {
          name: s.speaker?.name ?? "",
          description: s.speaker?.description ?? "",
        },
      }));
      setSessions(transformedSessions);
    }

    // Step 4: Policies - INCLUDE policyId
    if (conf.policies && conf.policies.length > 0) {
      const transformedPolicies: Policy[] = conf.policies.map((p) => ({
        policyId: p.policyId, // ⬅️ ADDED
        policyName: p.policyName ?? "",
        description: p.description ?? "",
      }));
      setPolicies(transformedPolicies);
    }

    // Step 5: Media - INCLUDE mediaId
    if (conf.media && conf.media.length > 0) {
      const transformedMedia: Media[] = conf.media.map((m) => ({
        mediaId: m.mediaId, // ⬅️ ADDED
        mediaFile: m.mediaUrl ?? "",
      }));
      setMediaList(transformedMedia);
    }

    // Step 6: Sponsors - INCLUDE sponsorId
    if (conf.sponsors && conf.sponsors.length > 0) {
      const transformedSponsors: Sponsor[] = conf.sponsors.map((s) => ({
        sponsorId: s.sponsorId, // ⬅️ ADDED
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
        if (!basicForm.categoryName) {
          toast.error("Vui lòng chọn danh mục!");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // ============================================
  // CREATE MODE - Handle Step Submit
  // ============================================
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
    try {
      setStepLoadings({ ...stepLoadings, prices: true });
      const data = { pricePhase, prices };
      await createPrice({ conferenceId, data }).unwrap();
      toast.success("Tạo giá vé thành công!");
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
        startTime: new Date(s.startTime).toISOString(),
        endTime: new Date(s.endTime).toISOString(),
        roomId: s.roomId,
        speaker: {
          name: s.speaker?.name || "",
          description: s.speaker?.description || "",
        },
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
        toast.success("✅ Basic info updated!");
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "❌ Failed to update basic info";

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

      const pricePromises = prices.map(async (price) => {
        try {
          if (price.priceId) {
            // UPDATE existing price
            await updatePrice({
              priceId: price.priceId,
              data: {
                ticketPrice: price.ticketPrice,
                ticketName: price.ticketName,
                ticketDescription: price.ticketDescription,
                actualPrice: price.actualPrice,
                pricePhaseId: price.pricePhaseId,
              },
            }).unwrap();
            priceUpdated++;
          } else {
            // CREATE new price
            await createPrice({
              conferenceId,
              data: { pricePhase, prices: [price] },
            }).unwrap();
            priceCreated++;
          }
        } catch (error) {
          console.error("Price operation failed:", error);
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
  const handleAddPrice = () => {
    if (!newPrice.ticketName || !newPrice.ticketPrice) return;
    setPrices([...prices, newPrice]);
    setNewPrice({
      ticketPrice: 0,
      ticketName: "",
      ticketDescription: "",
      actualPrice: 0,
    });
  };

  const handleAddSession = () => {
    if (!newSession.title || !newSession.speaker?.name) return;
    setSessions([...sessions, newSession]);
    setNewSession({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      roomId: "",
      speaker: { name: "", description: "" },
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
            <FormInput
              label="Sức chứa"
              name="capacity"
              type="number"
              value={basicForm.capacity}
              onChange={(val) => setBasicForm({ ...basicForm, capacity: Number(val) })}
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
              value={basicForm.categoryName}
              onChange={(val) => setBasicForm({ ...basicForm, categoryName: val })}
              options={categoryOptions}
              required
              disabled={isCategoriesLoading}
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
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">Danh sách vé ({prices.length})</h4>
              {prices.map((p, idx) => (
                <div
                  key={p.priceId || idx}
                  className="p-3 bg-gray-50 rounded mb-2 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{p.ticketName}</div>
                    <div className="text-sm text-gray-600">
                      {p.ticketPrice.toLocaleString()} VND
                    </div>
                    {p.priceId && (
                      <div className="text-xs text-blue-600">ID: {p.priceId}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewPrice(p);
                        setPrices(prices.filter((_, i) => i !== idx));
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setPrices(prices.filter((_, i) => i !== idx))}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-4 space-y-3 border-t pt-3">
                <FormInput
                  label="Tên vé"
                  name="ticketName"
                  value={newPrice.ticketName}
                  onChange={(val) => setNewPrice({ ...newPrice, ticketName: val })}
                />
                <FormInput
                  label="Mô tả"
                  name="ticketDescription"
                  value={newPrice.ticketDescription}
                  onChange={(val) => setNewPrice({ ...newPrice, ticketDescription: val })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Giá bán"
                    name="ticketPrice"
                    type="number"
                    value={newPrice.ticketPrice}
                    onChange={(val) => setNewPrice({ ...newPrice, ticketPrice: Number(val) })}
                  />
                </div>
                <Button onClick={handleAddPrice}>Thêm vé</Button>
              </div>
            </div>

            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">Giai đoạn giá</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Early bird kết thúc"
                    name="earlierBirdEndInterval"
                    type="date"
                    value={pricePhase.earlierBirdEndInterval}
                    onChange={(val) =>
                      setPricePhase({ ...pricePhase, earlierBirdEndInterval: val })
                    }
                  />
                  <FormInput
                    label="% giảm early"
                    name="percentForEarly"
                    type="number"
                    value={pricePhase.percentForEarly}
                    onChange={(val) =>
                      setPricePhase({ ...pricePhase, percentForEarly: Number(val) })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Standard kết thúc"
                    name="standardEndInterval"
                    type="date"
                    value={pricePhase.standardEndInterval}
                    onChange={(val) =>
                      setPricePhase({ ...pricePhase, standardEndInterval: val })
                    }
                  />
                  <FormInput
                    label="Late kết thúc"
                    name="lateEndInterval"
                    type="date"
                    value={pricePhase.lateEndInterval}
                    onChange={(val) => setPricePhase({ ...pricePhase, lateEndInterval: val })}
                  />
                </div>
                <FormInput
                  label="% tăng late"
                  name="percentForEnd"
                  type="number"
                  value={pricePhase.percentForEnd}
                  onChange={(val) => setPricePhase({ ...pricePhase, percentForEnd: Number(val) })}
                />
              </div>
            </div>
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
                sessions.map((s, idx) => (
                  <div
                    key={s.sessionId || idx}
                    className="p-3 bg-gray-50 rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{s.title || "Không có tiêu đề"}</div>
                      <div className="text-sm text-gray-600">
                        Diễn giả: {s.speaker?.name || "Chưa có diễn giả"}
                      </div>
                      {s.room && (
                        <div className="text-xs text-gray-500">
                          Phòng: {s.room.number} - {s.room.displayName}
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
                ))
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
                        ...(newSession.speaker || { name: "", description: "" }), 
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
                        ...(newSession.speaker || { name: "", description: "" }), 
                        description: val 
                      },
                    })
                  }
                  rows={2}
                />
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
                  <li>✓ Số loại vé: {prices.length}</li>
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