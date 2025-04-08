import BeaMentorcomponent from '@/components/admin/beaMentorcomponent'
import Sidebar from '@/components/admin/sidebar'
import React from 'react'

function Page() {
  return (
   <Sidebar Content={<BeaMentorcomponent/>} path="beamentor" />
  )
}

export default Page
