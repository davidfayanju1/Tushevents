import InvitationCard from "@/components/iv-card/IvCardComp";
import React, { Suspense } from "react";

const IVCardPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvitationCard />
    </Suspense>
  );
};

export default IVCardPage;
