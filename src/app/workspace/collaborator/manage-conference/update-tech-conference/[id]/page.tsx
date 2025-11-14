// import UpdateConferenceStepPage from "@/components/(user)/workspace/collaborator/ManageConference/TechConference/update/index1";

// export default function Page() {
//   return <UpdateConferenceStepPage />;
// }


"use client";
import { useParams } from "next/navigation";
import TechConferenceStepForm from "@/components/molecules/Conference/ConferenceForm/tech/index";

export default function UpdateTechConferencePage() {
  const params = useParams();
  const conferenceId = params.id as string;

  if (!conferenceId) {
    throw new Error("Conference ID is required");
  }

  return <TechConferenceStepForm mode="edit" conferenceId={conferenceId} />;
}