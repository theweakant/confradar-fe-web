import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/molecules/FormInput";
import { FormTextArea } from "@/components/molecules/FormTextArea";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import {
  useCreateBasicConferenceMutation,
  useCreateConferencePriceMutation,
  useCreateConferenceSessionsMutation,
  useCreateConferencePoliciesMutation,
  useCreateConferenceMediaMutation,
  useCreateConferenceSponsorsMutation,
} from "@/redux/services/conferenceStep.service";
import {
  nextStep,
  prevStep,
  setConferenceId,
  resetWizard,
} from "@/redux/slices/conferenceStep.slice";
import type {
  ConferenceBasicForm,
  PricePhase,
  Price,
  Session,
  Speaker,
  Policy,
  Media,
  Sponsor,
} from "@/types/conference.type";

const STEPS = [
  { id: 1, title: "Thông tin cơ bản" },
  { id: 2, title: "Giá vé" },
  { id: 3, title: "Phiên họp" },
  { id: 4, title: "Chính sách" },
  { id: 5, title: "Media" },
  { id: 6, title: "Nhà tài trợ" },
];

interface ConferenceStepFormProps {
  conference?: any | null; 
  onSave?: (data: any) => void; 
  onCancel?: () => void;
}

export function ConferenceStepForm({ conference, onSave, onCancel }: ConferenceStepFormProps) {
  const dispatch = useAppDispatch();
  const { currentStep, conferenceId } = useAppSelector(
    (state) => state.conferenceStep
  );

  // API Mutations
  const [createBasic, { isLoading: isCreatingBasic }] =
    useCreateBasicConferenceMutation();
  const [createPrice, { isLoading: isCreatingPrice }] =
    useCreateConferencePriceMutation();
  const [createSessions, { isLoading: isCreatingSessions }] =
    useCreateConferenceSessionsMutation();
  const [createPolicies, { isLoading: isCreatingPolicies }] =
    useCreateConferencePoliciesMutation();
  const [createMedia, { isLoading: isCreatingMedia }] =
    useCreateConferenceMediaMutation();
  const [createSponsors, { isLoading: isCreatingSponsors }] =
    useCreateConferenceSponsorsMutation();

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

  // Handle Step 1 Submit
  const handleBasicSubmit = async () => {
    try {
      const result = await createBasic(basicForm).unwrap();
      const confId = result.data.conferenceId;
      dispatch(setConferenceId(confId));
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create basic info:", error);
    }
  };

  // Handle Step 2 Submit
  const handlePriceSubmit = async () => {
    if (!conferenceId) return;
    try {
      await createPrice({
        conferenceId,
        data: { pricePhase, prices },
      }).unwrap();
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create price:", error);
    }
  };

  // Handle Step 3 Submit
  const handleSessionSubmit = async () => {
    if (!conferenceId) return;
    try {
      await createSessions({
        conferenceId,
        data: { sessions },
      }).unwrap();
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create sessions:", error);
    }
  };

  // Handle Step 4 Submit
  const handlePolicySubmit = async () => {
    if (!conferenceId) return;
    try {
      await createPolicies({
        conferenceId,
        data: { policies },
      }).unwrap();
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create policies:", error);
    }
  };

  // Handle Step 5 Submit
  const handleMediaSubmit = async () => {
    if (!conferenceId) return;
    try {
      await createMedia({
        conferenceId,
        data: { media: mediaList },
      }).unwrap();
      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to create media:", error);
    }
  };

  // Handle Step 6 Submit (Final)
  const handleSponsorSubmit = async () => {
    if (!conferenceId) return;
    try {
      await createSponsors({
        conferenceId,
        data: { sponsors },
      }).unwrap();
      alert("Tạo hội thảo thành công!");
      dispatch(resetWizard());
    } catch (error) {
      console.error("Failed to create sponsors:", error);
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
    if (!newSession.title || !newSession.speaker.name) return;
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
    setNewMedia({ mediaFile: ""});
  };

  const handleAddSponsor = () => {
    if (!newSponsor.name) return;
    setSponsors([...sponsors, newSponsor]);
    setNewSponsor({ name: "", imageFile: "" });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
            <FormInput
              label="Tên hội thảo"
              name="conferenceName"
              value={basicForm.conferenceName}
              onChange={(val) =>
                setBasicForm({ ...basicForm, conferenceName: val })
              }
              required
            />
            <FormTextArea
              label="Mô tả"
              value={basicForm.description ?? ""}
              onChange={(val) =>
                setBasicForm({ ...basicForm, description: val })
              }
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Ngày bắt đầu"
                name="startDate"
                type="date"
                value={basicForm.startDate}
                onChange={(val) =>
                  setBasicForm({ ...basicForm, startDate: val })
                }
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
              onChange={(val) =>
                setBasicForm({ ...basicForm, capacity: Number(val) })
              }
            />
            <FormInput
              label="Địa chỉ"
              name="address"
              value={basicForm.address}
              onChange={(val) => setBasicForm({ ...basicForm, address: val })}
            />
            <FormInput
              label="Danh mục"
              name="categoryName"
              value={basicForm.categoryName}
              onChange={(val) =>
                setBasicForm({ ...basicForm, categoryName: val })
              }
              required
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={basicForm.isInternalHosted}
                  onChange={(e) =>
                    setBasicForm({
                      ...basicForm,
                      isInternalHosted: e.target.checked,
                    })
                  }
                />
                <span>Tổ chức nội bộ</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={basicForm.isResearchConference}
                  onChange={(e) =>
                    setBasicForm({
                      ...basicForm,
                      isResearchConference: e.target.checked,
                    })
                  }
                />
                <span>Hội nghị nghiên cứu</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Banner Image</label>
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
            
            {/* Price Phase */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">Giai đoạn giá</h4>
              <div className="space-y-3">
                <FormInput
                  label="Tên giai đoạn"
                  name="name"
                  value={pricePhase.name}
                  onChange={(val) => setPricePhase({ ...pricePhase, name: val })}
                />
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
                    onChange={(val) =>
                      setPricePhase({ ...pricePhase, lateEndInterval: val })
                    }
                  />
                </div>
                <FormInput
                  label="% tăng late"
                  name="percentForEnd"
                  type="number"
                  value={pricePhase.percentForEnd}
                  onChange={(val) =>
                    setPricePhase({ ...pricePhase, percentForEnd: Number(val) })
                  }
                />
              </div>
            </div>

            {/* Prices List */}
            <div className="border p-4 rounded">
              <h4 className="font-medium mb-3">Danh sách vé ({prices.length})</h4>
              {prices.map((p, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded mb-2">
                  <div className="font-medium">{p.ticketName}</div>
                  <div className="text-sm text-gray-600">
                    {p.ticketPrice.toLocaleString()} VND
                  </div>
                </div>
              ))}

              {/* Add Price Form */}
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
                  onChange={(val) =>
                    setNewPrice({ ...newPrice, ticketDescription: val })
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Giá bán"
                    name="ticketPrice"
                    type="number"
                    value={newPrice.ticketPrice}
                    onChange={(val) =>
                      setNewPrice({ ...newPrice, ticketPrice: Number(val) })
                    }
                  />
                  <FormInput
                    label="Giá gốc"
                    name="actualPrice"
                    type="number"
                    value={newPrice.actualPrice}
                    onChange={(val) =>
                      setNewPrice({ ...newPrice, actualPrice: Number(val) })
                    }
                  />
                </div>
                <Button onClick={handleAddPrice}>Thêm vé</Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Phiên họp</h3>
            
            {/* Sessions List */}
            <div className="space-y-2">
              {sessions.map((s, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">{s.title}</div>
                  <div className="text-sm text-gray-600">
                    Diễn giả: {s.speaker.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Session Form */}
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
                value={newSession.description}
                onChange={(val) =>
                  setNewSession({ ...newSession, description: val })
                }
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Thời gian bắt đầu"
                  name="startTime"
                  type="datetime-local"
                  value={newSession.startTime}
                  onChange={(val) =>
                    setNewSession({ ...newSession, startTime: val })
                  }
                />
                <FormInput
                  label="Thời gian kết thúc"
                  name="endTime"
                  type="datetime-local"
                  value={newSession.endTime}
                  onChange={(val) =>
                    setNewSession({ ...newSession, endTime: val })
                  }
                />
              </div>
              <FormInput
                label="Room ID"
                name="roomId"
                value={newSession.roomId}
                onChange={(val) => setNewSession({ ...newSession, roomId: val })}
              />
              <div className="border-t pt-3">
                <h5 className="font-medium mb-2">Diễn giả</h5>
                <FormInput
                  label="Tên"
                  name="speakerName"
                  value={newSession.speaker.name}
                  onChange={(val) =>
                    setNewSession({
                      ...newSession,
                      speaker: { ...newSession.speaker, name: val },
                    })
                  }
                />
                <FormTextArea
                  label="Mô tả"
                  value={newSession.speaker.description}
                  onChange={(val) =>
                    setNewSession({
                      ...newSession,
                      speaker: { ...newSession.speaker, description: val },
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
            
            {/* Policies List */}
            <div className="space-y-2">
              {policies.map((p, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">{p.policyName}</div>
                  <div className="text-sm text-gray-600">{p.description}</div>
                </div>
              ))}
            </div>

            {/* Add Policy Form */}
            <div className="border p-4 rounded space-y-3">
              <h4 className="font-medium">Thêm chính sách</h4>
              <FormInput
                label="Tên chính sách"
                name="policyName"
                value={newPolicy.policyName}
                onChange={(val) =>
                  setNewPolicy({ ...newPolicy, policyName: val })
                }
              />
              <FormTextArea
                label="Mô tả"
                value={newPolicy.description}
                onChange={(val) =>
                  setNewPolicy({ ...newPolicy, description: val })
                }
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
            
            {/* Media List */}
            <div className="space-y-2">
              {mediaList.map((m, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded">
                  <div className="text-sm">{m.mediaFile}</div>
                </div>
              ))}
            </div>

            {/* Add Media Form */}
            <div className="border p-4 rounded space-y-3">
              <h4 className="font-medium">Thêm media</h4>
              <FormInput
                label="Media File URL"
                name="mediaFile"
                value={newMedia.mediaFile}
                onChange={(val) => setNewMedia({ ...newMedia, mediaFile: val })}
              />
   
              <Button onClick={handleAddMedia}>Thêm media</Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nhà tài trợ</h3>
            
            {/* Sponsors List */}
            <div className="space-y-2">
              {sponsors.map((s, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-gray-600">{s.imageFile}</div>
                </div>
              ))}
            </div>

            {/* Add Sponsor Form */}
            <div className="border p-4 rounded space-y-3">
              <h4 className="font-medium">Thêm nhà tài trợ</h4>
              <FormInput
                label="Tên"
                name="name"
                value={newSponsor.name}
                onChange={(val) => setNewSponsor({ ...newSponsor, name: val })}
              />
              <FormInput
                label="Image File URL"
                name="imageFile"
                value={newSponsor.imageFile}
                onChange={(val) =>
                  setNewSponsor({ ...newSponsor, imageFile: val })
                }
              />
              <Button onClick={handleAddSponsor}>Thêm nhà tài trợ</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 1:
        handleBasicSubmit();
        break;
      case 2:
        handlePriceSubmit();
        break;
      case 3:
        handleSessionSubmit();
        break;
      case 4:
        handlePolicySubmit();
        break;
      case 5:
        handleMediaSubmit();
        break;
      case 6:
        handleSponsorSubmit();
        break;
    }
  };

  const isLoading =
    isCreatingBasic ||
    isCreatingPrice ||
    isCreatingSessions ||
    isCreatingPolicies ||
    isCreatingMedia ||
    isCreatingSponsors;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                step.id === currentStep
                  ? "text-blue-600 font-semibold"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  step.id === currentStep
                    ? "bg-blue-600 text-white"
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

      {/* Step Content */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={() => dispatch(prevStep())}
          disabled={currentStep === 1}
          className="px-6"
        >
          Quay lại
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="px-6 bg-blue-600 text-white"
        >
          {isLoading
            ? "Đang xử lý..."
            : currentStep === 6
            ? "Hoàn thành"
            : "Tiếp theo"}
        </Button>
      </div>
    </div>
  );
}