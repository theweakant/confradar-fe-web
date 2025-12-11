import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AvailableCustomerResponse, Abstract, ResearchPhaseDtoDetail, ResearchConferenceInfo } from "@/types/paper.type";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import { validatePhaseTime } from "@/helper/timeValidation";
import SubmittedPaperCard from "./SubmittedPaperCard";
import { toast } from "sonner";
import SubmissionFormDialog from "./SubmissionFormDialog";
import { parseApiError } from "@/helper/api";
import { useGlobalTime } from "@/utils/TimeContext";

interface AbstractPhaseProps {
  paperId?: string;
  abstract?: Abstract | null;
  researchPhase?: ResearchPhaseDtoDetail;
  researchConferenceInfo?: ResearchConferenceInfo | null;

  onSubmittedAbstract?: () => void;
}

const AbstractPhase: React.FC<AbstractPhaseProps> = ({ paperId, abstract, researchPhase, onSubmittedAbstract, researchConferenceInfo }) => {
  const isSubmitted = !!abstract;

  const { now } = useGlobalTime();

  // Validate phase timing
  const phaseValidation = validatePhaseTime(
    researchPhase?.registrationStartDate,
    researchPhase?.registrationEndDate,
    now
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoauthors, setSelectedCoauthors] = useState<AvailableCustomerResponse[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomerResponse[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);


  const {
    fetchAvailableCustomers,
    handleSubmitAbstract,
    handleUpdateAbstract,
    submitAbstractError,
    updateAbstractError,
    loading: submitLoading
  } = usePaperCustomer();

  useEffect(() => {
    if (isEditing && abstract) {
      setTitle(abstract.title || "");
      setDescription(abstract.description || "");
      // Load co-authors nếu có trong abstract data
      // setSelectedCoauthors(abstract.coAuthors || []);
    }
  }, [isEditing, abstract]);

  const loadAvailableCustomers = async () => {
    if (isLoadingCustomers || availableCustomers.length > 0) return;

    setIsLoadingCustomers(true);
    setCustomersError(null);

    try {
      const response = await fetchAvailableCustomers(researchConferenceInfo?.conferenceId ?? undefined);
      setAvailableCustomers(response.data || []);
    } catch (error: unknown) {
      // if (error?.data?.Message) {
      //     setCustomersError(error.data.Message);
      // } else if (error?.data?.Errors) {
      //     const errors = Object.values(error.data.Errors);
      //     setCustomersError(errors.length > 0 ? errors[0] as string : "Có lỗi xảy ra khi tải danh sách người dùng");
      // } else {
      //     setCustomersError("Có lỗi xảy ra khi tải danh sách người dùng");
      // }
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleSelectCoauthor = (user: AvailableCustomerResponse) => {
    if (!selectedCoauthors.some((c) => c.userId === user.userId)) {
      setSelectedCoauthors((prev) => [...prev, user]);
    }
    setIsDialogOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // const handleSubmitAbstractForm = async () => {
  //   if (!selectedFile || !paperId || !title.trim() || !description.trim()) {
  //     alert("Vui lòng chọn file abstract, nhập title, description và đảm bảo có Paper ID");
  //     return;
  //   }

  //   try {
  //     const coAuthorIds = selectedCoauthors.map(c => c.userId);
  //     if (isEditing) {
  //       // Update mode
  //       await handleUpdateAbstract(paperId, {
  //         title: title.trim(),
  //         description: description.trim(),
  //         abstractFile: selectedFile,
  //         coAuthorId: coAuthorIds
  //       });

  //       toast.success("Cập nhật abstract thành công!");
  //       setIsEditing(false);
  //     } else {
  //       // Create mode
  //       await handleSubmitAbstract({
  //         abstractFile: selectedFile!,
  //         paperId,
  //         title: title.trim(),
  //         description: description.trim(),
  //         coAuthorId: coAuthorIds
  //       });
  //       toast.success("Nộp abstract thành công!");
  //     }

  //     toast.success("Nộp abstract thành công!");
  //     // Reset form
  //     setSelectedFile(null);
  //     setTitle("");
  //     setDescription("");
  //     setSelectedCoauthors([]);

  //     onSubmittedAbstract?.();
  //   } catch (error: unknown) {
  //     // const errorMessage = "Có lỗi xảy ra khi nộp abstract";
  //     // toast.error(errorMessage);
  //   }
  // };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    loadAvailableCustomers();
  };

  const filteredCustomers = availableCustomers.filter((c) =>
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (submitAbstractError) toast.error(parseApiError<string>(submitAbstractError)?.data?.message)
    if (updateAbstractError) toast.error(parseApiError<string>(updateAbstractError)?.data?.message)
  }, [submitAbstractError, updateAbstractError]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Giai đoạn Abstract</h3>
      <p className="text-gray-600">Nộp abstract và chọn đồng tác giả cho bài báo của bạn.</p>

      {/* Phase timing information */}
      {phaseValidation.formattedPeriod && (
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
          <p className="text-gray-700 text-sm mb-2">
            <strong>Thời gian diễn ra:</strong> {phaseValidation.formattedPeriod}
          </p>

          {/* Time validation message */}
          {!phaseValidation.isAvailable && (
            <div className={`border rounded-lg p-3 ${phaseValidation.isExpired
              ? "bg-red-50 border-red-300"
              : "bg-yellow-50 border-yellow-300"
              }`}>
              <p className={`text-sm ${phaseValidation.isExpired ? "text-red-700" : "text-yellow-700"
                }`}>
                {phaseValidation.message}
              </p>
            </div>
          )}

          {/* Available deadline countdown */}
          {phaseValidation.isAvailable && phaseValidation.daysRemaining && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
              <p className="text-blue-700 text-sm">
                {phaseValidation.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Show current abstract if exists */}
      {abstract && (
        <SubmittedPaperCard
          paperInfo={{
            id: abstract.abstractId,
            title: abstract.title,
            description: abstract.description,
            status: abstract.status,
            created: abstract.created,
            updated: abstract.updated,
            fileUrl: abstract.fileUrl,
            reason: abstract.reason
          }}
          paperType="Abstract"
        />
      )}

      {!abstract && phaseValidation.isAvailable && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Bạn chưa có submission nào</p>
          <button
            onClick={() => setIsSubmitDialogOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Nộp Abstract
          </button>
        </div>
      )}

      {abstract && phaseValidation.isAvailable && (
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsSubmitDialogOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            Chỉnh sửa Abstract
          </button>
        </div>
      )}

      <SubmissionFormDialog
        isOpen={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        onSubmit={async (data) => {
          try {
            if (abstract) {
              const result = await handleUpdateAbstract(paperId!, {
                title: data.title,
                description: data.description,
                abstractFile: data.file,
                coAuthorId: data.coAuthorIds || []
              });

              if (result.success) {
                toast.success("Cập nhật abstract thành công!");
                onSubmittedAbstract?.();
                return { success: true };
              }
              // } else {
              //   const result = await handleSubmitAbstract({
              //     abstractFile: data.file!,
              //     paperId: paperId!,
              //     title: data.title,
              //     description: data.description,
              //     coAuthorId: data.coAuthorIds || []
              //   });

              //   if (result.success) {
              //     toast.success("Nộp abstract thành công!");
              //     onSubmittedAbstract?.();
              //     return { success: true };
              //   }
            }
            return { success: false };
          } catch (error) {
            return { success: false };
          }
        }}
        title={abstract ? "Chỉnh sửa Abstract" : "Nộp Abstract"}
        loading={submitLoading}
        includeCoauthors={true}
        availableCustomers={availableCustomers}
        isLoadingCustomers={isLoadingCustomers}
        onLoadCustomers={loadAvailableCustomers}
        isEditMode={!!abstract}
        initialData={abstract ? {
          title: abstract.title || "",
          description: abstract.description || "",
          file: null,
          coAuthorIds: []
        } : undefined}
        shouldCloseOnSuccess={false}
      />


      <Dialog open={isDialogOpen} as="div" className="relative z-50" onClose={setIsDialogOpen}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 text-gray-900 duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
          >
            <DialogTitle as="h3" className="text-lg font-semibold mb-4">
              Chọn đồng tác giả
            </DialogTitle>

            {/* Search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 text-sm rounded-lg pl-9 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none border border-gray-300"
              />
            </div>

            {/* List available customers */}
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {isLoadingCustomers ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 text-sm mt-2">Đang tải danh sách...</p>
                </div>
              ) : customersError ? (
                <div className="text-center py-4">
                  <p className="text-red-600 text-sm">{customersError}</p>
                  <button
                    onClick={() => {
                      setCustomersError(null);
                      loadAvailableCustomers();
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                  >
                    Thử lại
                  </button>
                </div>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((user) => (
                  <button
                    key={user.userId}
                    onClick={() => handleSelectCoauthor(user)}
                    className="flex items-center gap-3 w-full text-left bg-gray-100 hover:bg-gray-200 rounded-lg p-3 transition"
                  >
                    <Image
                      src={user.avatarUrl || "/default-avatar.png"}
                      alt={user.fullName || ""}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-600 text-sm text-center py-3">
                  {availableCustomers.length === 0 ? "Không có người dùng nào." : "Không tìm thấy kết quả."}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-900 transition"
              >
                Đóng
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div >
  );
};

export default AbstractPhase;

// import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
// import { Search } from "lucide-react";
// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { AvailableCustomerResponse, Abstract, ResearchPhaseDtoDetail, ResearchConferenceInfo } from "@/types/paper.type";
// import { usePaperCustomer } from "@/redux/hooks/usePaper";
// import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
// import "@cyntler/react-doc-viewer/dist/index.css";
// import { validatePhaseTime } from "@/helper/timeValidation";
// import SubmittedPaperCard from "./SubmittedPaperCard";
// import { toast } from "sonner";
// import SubmissionFormDialog from "./SubmissionFormDialog";
// import { parseApiError } from "@/helper/api";

// interface AbstractPhaseProps {
//   paperId?: string;
//   abstract?: Abstract | null;
//   researchPhase?: ResearchPhaseDtoDetail;
//   researchConferenceInfo?: ResearchConferenceInfo | null;

//   onSubmittedAbstract?: () => void;
// }

// const AbstractPhase: React.FC<AbstractPhaseProps> = ({ paperId, abstract, researchPhase, onSubmittedAbstract, researchConferenceInfo }) => {
//   const isSubmitted = !!abstract;

//   // Validate phase timing
//   const phaseValidation = validatePhaseTime(
//     researchPhase?.registrationStartDate,
//     researchPhase?.registrationEndDate
//   );

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCoauthors, setSelectedCoauthors] = useState<AvailableCustomerResponse[]>([]);
//   const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomerResponse[]>([]);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
//   const [customersError, setCustomersError] = useState<string | null>(null);

//   const [isEditing, setIsEditing] = useState(false);
//   const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);


//   const {
//     fetchAvailableCustomers,
//     handleSubmitAbstract,
//     handleUpdateAbstract,
//     submitAbstractError,
//     updateAbstractError,
//     loading: submitLoading
//   } = usePaperCustomer();

//   useEffect(() => {
//     if (isEditing && abstract) {
//       setTitle(abstract.title || "");
//       setDescription(abstract.description || "");
//       // Load co-authors nếu có trong abstract data
//       // setSelectedCoauthors(abstract.coAuthors || []);
//     }
//   }, [isEditing, abstract]);

//   const loadAvailableCustomers = async () => {
//     if (isLoadingCustomers || availableCustomers.length > 0) return;

//     setIsLoadingCustomers(true);
//     setCustomersError(null);

//     try {
//       const response = await fetchAvailableCustomers(researchConferenceInfo?.conferenceId ?? undefined);
//       setAvailableCustomers(response.data || []);
//     } catch (error: unknown) {
//       // if (error?.data?.Message) {
//       //     setCustomersError(error.data.Message);
//       // } else if (error?.data?.Errors) {
//       //     const errors = Object.values(error.data.Errors);
//       //     setCustomersError(errors.length > 0 ? errors[0] as string : "Có lỗi xảy ra khi tải danh sách người dùng");
//       // } else {
//       //     setCustomersError("Có lỗi xảy ra khi tải danh sách người dùng");
//       // }
//     } finally {
//       setIsLoadingCustomers(false);
//     }
//   };

//   const handleSelectCoauthor = (user: AvailableCustomerResponse) => {
//     if (!selectedCoauthors.some((c) => c.userId === user.userId)) {
//       setSelectedCoauthors((prev) => [...prev, user]);
//     }
//     setIsDialogOpen(false);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);
//     }
//   };

//   const handleSubmitAbstractForm = async () => {
//     if (!selectedFile || !paperId || !title.trim() || !description.trim()) {
//       alert("Vui lòng chọn file abstract, nhập title, description và đảm bảo có Paper ID");
//       return;
//     }

//     try {
//       const coAuthorIds = selectedCoauthors.map(c => c.userId);
//       if (isEditing) {
//         // Update mode
//         await handleUpdateAbstract(paperId, {
//           title: title.trim(),
//           description: description.trim(),
//           abstractFile: selectedFile,
//           coAuthorId: coAuthorIds
//         });

//         toast.success("Cập nhật abstract thành công!");
//         setIsEditing(false);
//       } else {
//         // Create mode
//         await handleSubmitAbstract({
//           abstractFile: selectedFile!,
//           paperId,
//           title: title.trim(),
//           description: description.trim(),
//           coAuthorId: coAuthorIds
//         });
//         toast.success("Nộp abstract thành công!");
//       }

//       toast.success("Nộp abstract thành công!");
//       // Reset form
//       setSelectedFile(null);
//       setTitle("");
//       setDescription("");
//       setSelectedCoauthors([]);

//       onSubmittedAbstract?.();
//     } catch (error: unknown) {
//       // const errorMessage = "Có lỗi xảy ra khi nộp abstract";
//       // toast.error(errorMessage);
//     }
//   };

//   const handleOpenDialog = () => {
//     setIsDialogOpen(true);
//     loadAvailableCustomers();
//   };

//   const filteredCustomers = availableCustomers.filter((c) =>
//     c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   useEffect(() => {
//     if (submitAbstractError) toast.error(parseApiError<string>(submitAbstractError)?.data?.message)
//     if (updateAbstractError) toast.error(parseApiError<string>(updateAbstractError)?.data?.message)
//   }, [submitAbstractError, updateAbstractError]);

//   return (
//     <div className="space-y-6">
//       <h3 className="text-lg font-semibold">Giai đoạn Abstract</h3>
//       <p className="text-gray-400">Nộp abstract và chọn đồng tác giả cho bài báo của bạn.</p>

//       {/* Phase timing information */}
//       {phaseValidation.formattedPeriod && (
//         <div className="bg-gray-800 border border-gray-600 rounded-xl p-4">
//           <p className="text-gray-300 text-sm mb-2">
//             <strong>Thời gian diễn ra:</strong> {phaseValidation.formattedPeriod}
//           </p>

//           {/* Time validation message */}
//           {!phaseValidation.isAvailable && (
//             <div className={`border rounded-lg p-3 ${phaseValidation.isExpired
//               ? "bg-red-900/20 border-red-700"
//               : "bg-yellow-900/20 border-yellow-700"
//               }`}>
//               <p className={`text-sm ${phaseValidation.isExpired ? "text-red-400" : "text-yellow-400"
//                 }`}>
//                 {phaseValidation.message}
//               </p>
//             </div>
//           )}

//           {/* Available deadline countdown */}
//           {phaseValidation.isAvailable && phaseValidation.daysRemaining && (
//             <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
//               <p className="text-blue-400 text-sm">
//                 {phaseValidation.message}
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Show current abstract if exists */}
//       {abstract && (
//         <SubmittedPaperCard
//           paperInfo={{
//             id: abstract.abstractId,
//             title: abstract.title,
//             description: abstract.description,
//             status: abstract.status,
//             created: abstract.created,
//             updated: abstract.updated,
//             fileUrl: abstract.fileUrl
//           }}
//           paperType="Abstract"
//         />
//       )}

//       {!abstract && phaseValidation.isAvailable && (
//         <div className="text-center py-12">
//           <p className="text-gray-400 mb-4">Bạn chưa có submission nào</p>
//           <button
//             onClick={() => setIsSubmitDialogOpen(true)}
//             className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
//           >
//             Nộp Abstract
//           </button>
//         </div>
//       )}

//       {abstract && phaseValidation.isAvailable && (
//         <div className="flex justify-end mt-4">
//           <button
//             onClick={() => setIsSubmitDialogOpen(true)}
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
//           >
//             Chỉnh sửa Abstract
//           </button>
//         </div>
//       )}

//       <SubmissionFormDialog
//         isOpen={isSubmitDialogOpen}
//         onClose={() => setIsSubmitDialogOpen(false)}
//         onSubmit={async (data) => {
//           try {
//             if (abstract) {
//               const result = await handleUpdateAbstract(paperId!, {
//                 title: data.title,
//                 description: data.description,
//                 abstractFile: data.file,
//                 coAuthorId: data.coAuthorIds || []
//               });

//               if (result.success) {
//                 toast.success("Cập nhật abstract thành công!");
//                 onSubmittedAbstract?.();
//                 return { success: true };
//               }
//             } else {
//               const result = await handleSubmitAbstract({
//                 abstractFile: data.file!,
//                 paperId: paperId!,
//                 title: data.title,
//                 description: data.description,
//                 coAuthorId: data.coAuthorIds || []
//               });

//               if (result.success) {
//                 toast.success("Nộp abstract thành công!");
//                 onSubmittedAbstract?.();
//                 return { success: true };
//               }
//             }
//             return { success: false };
//           } catch (error) {
//             return { success: false };
//           }
//         }}
//         title={abstract ? "Chỉnh sửa Abstract" : "Nộp Abstract"}
//         loading={submitLoading}
//         includeCoauthors={true}
//         availableCustomers={availableCustomers}
//         isLoadingCustomers={isLoadingCustomers}
//         onLoadCustomers={loadAvailableCustomers}
//         isEditMode={!!abstract}
//         initialData={abstract ? {
//           title: abstract.title || "",
//           description: abstract.description || "",
//           file: null,
//           coAuthorIds: []
//         } : undefined}
//         shouldCloseOnSuccess={false}
//       />


//       <Dialog open={isDialogOpen} as="div" className="relative z-50" onClose={setIsDialogOpen}>
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
//         <div className="fixed inset-0 flex items-center justify-center p-4">
//           <DialogPanel
//             transition
//             className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl p-6 text-white duration-300 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
//           >
//             <DialogTitle as="h3" className="text-lg font-semibold mb-4">
//               Chọn đồng tác giả
//             </DialogTitle>

//             {/* Search bar */}
//             <div className="relative mb-4">
//               <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Tìm kiếm theo tên..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full bg-gray-700 text-sm rounded-lg pl-9 pr-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
//               />
//             </div>

//             {/* List available customers */}
//             <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
//               {isLoadingCustomers ? (
//                 <div className="text-center py-4">
//                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
//                   <p className="text-gray-400 text-sm mt-2">Đang tải danh sách...</p>
//                 </div>
//               ) : customersError ? (
//                 <div className="text-center py-4">
//                   <p className="text-red-400 text-sm">{customersError}</p>
//                   <button
//                     onClick={() => {
//                       setCustomersError(null);
//                       loadAvailableCustomers();
//                     }}
//                     className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
//                   >
//                     Thử lại
//                   </button>
//                 </div>
//               ) : filteredCustomers.length > 0 ? (
//                 filteredCustomers.map((user) => (
//                   <button
//                     key={user.userId}
//                     onClick={() => handleSelectCoauthor(user)}
//                     className="flex items-center gap-3 w-full text-left bg-white/10 hover:bg-white/20 rounded-lg p-3 transition"
//                   >
//                     <Image
//                       src={user.avatarUrl || "/default-avatar.png"}
//                       alt={user.fullName || ""}
//                       width={32}
//                       height={32}
//                       className="rounded-full"
//                     />
//                     <div>
//                       <p className="font-medium">{user.fullName}</p>
//                       <p className="text-xs text-gray-400">{user.email}</p>
//                     </div>
//                   </button>
//                 ))
//               ) : (
//                 <p className="text-gray-400 text-sm text-center py-3">
//                   {availableCustomers.length === 0 ? "Không có người dùng nào." : "Không tìm thấy kết quả."}
//                 </p>
//               )}
//             </div>

//             {/* Buttons */}
//             <div className="mt-5 flex justify-end">
//               <button
//                 onClick={() => setIsDialogOpen(false)}
//                 className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
//               >
//                 Đóng
//               </button>
//             </div>
//           </DialogPanel>
//         </div>
//       </Dialog>
//     </div >
//   );
// };

// export default AbstractPhase;