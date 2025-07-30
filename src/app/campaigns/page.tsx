"use client";
import React from "react";
import TaxonomyList from "@/components/features/campaign/taxonomy/TaxonomyList";
import TaxonomyForm from "@/components/features/campaign/taxonomy/TaxonomyForm";

const Campaigns = () => {
  return (
    <>
      <TaxonomyList />
      <TaxonomyForm />
    </>
  );
};

export default Campaigns;
