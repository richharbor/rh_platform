import AddSharePage from '@/pages/Users/Selling/AddShare/AddShare';
import React from 'react';

interface PageProps {
  params: {
    id: string;
  };
}

const Page = ({ params }: PageProps) => {
  return <AddSharePage id={params.id} update={true} />;
};

export default Page;