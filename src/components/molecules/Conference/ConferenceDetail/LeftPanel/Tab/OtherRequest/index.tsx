"use client";

import { 
  useGetPendingPresenterChangeRequestsQuery, 
  useGetPendingSessionChangeRequestsQuery 
} from "@/redux/services/assigningpresentersession.service";
import { PresenterList } from "./Presenter/PresenterList";
import { SessionChangeList } from "./Session/SessionChangeList";


interface OtherRequestTabProps {
  conferenceId: string;
}

export function OtherRequestTab({ conferenceId }: OtherRequestTabProps) {
  const { data: presenterChangeData } = useGetPendingPresenterChangeRequestsQuery(conferenceId);
  const { data: sessionChangeData } = useGetPendingSessionChangeRequestsQuery(conferenceId);
  
  const changePresenterRequests = presenterChangeData?.data || [];
  const changeSessionRequests = sessionChangeData?.data || [];

  return (
    <div className="space-y-6">
      <SessionChangeList requests={changeSessionRequests} />
      <PresenterList requests={changePresenterRequests} />
    </div>
  );
}