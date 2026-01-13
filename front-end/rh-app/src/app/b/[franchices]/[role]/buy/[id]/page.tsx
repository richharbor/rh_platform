import React from 'react'
import SharePage from '@/pages/Users/SharePage/SharePage'

interface PageProps {
  params: {
    id: string
  }
}

const Page = ({ params }: PageProps) => {
  const { id } = params

  return <SharePage id={id} />
}

export default Page