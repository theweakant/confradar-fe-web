// import UpdateConferenceStepPage from "@/components/(user)/workspace/organizer/ManageConference/ConferenceForm/research/update/index1";

// export default function Page() {
//   return <UpdateConferenceStepPage />;
// }
"use client";

import { useParams } from "next/navigation";
import ResearchConferenceStepForm from "@/components/(user)/workspace/organizer/ManageConference/ConferenceForm/research/index";

export default function UpdateResearchConferencePage() {
  const params = useParams();
  const conferenceId = params.id as string;

  if (!conferenceId) {
    throw new Error("Conference ID is required");
  }

  return <ResearchConferenceStepForm mode="edit" conferenceId={conferenceId} />;
}