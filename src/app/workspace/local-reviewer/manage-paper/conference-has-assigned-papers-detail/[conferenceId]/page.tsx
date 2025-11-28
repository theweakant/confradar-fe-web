import ConferenceDetailPage from "@/components/(user)/workspace/reviewer/ConferenceDetailPage/ConferenceDetailPage";

interface PageProps {
  params: {
    conferenceId: string;
    reviewerType: string;
  };
}

export default async function ConferenceHasAssignedPapersDetailPage({ params }: PageProps) {
  const { conferenceId, reviewerType } = await params;

  return (
    <ConferenceDetailPage
      conferenceId={conferenceId}
    // reviewerType={reviewerType}
    />
  );
}
