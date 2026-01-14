import BestDealPage from '@/pages/Users/BestDeals/BestDealPage';
import React from 'react';

interface PageProps {
  params: {
    id: string;
  };
}

const Page = ({ params }: PageProps) => {
  return <BestDealPage id={params.id} />;
};

export default Page;