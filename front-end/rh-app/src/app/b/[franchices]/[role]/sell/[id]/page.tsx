import SharePage from '@/pages/Users/SharePage/SharePage';
import AddSharePage from '@/pages/Users/Selling/AddShare/AddShare';
import MySharePage from '@/pages/Users/MySharePage/MySharePage';
import React from 'react';

interface PageProps {
  params: {
    id: string;
  };
}

const Page = ({ params }: PageProps) => {
  return <MySharePage id={params.id} />;
};

export default Page;