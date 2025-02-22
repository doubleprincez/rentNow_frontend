import React from 'react';
import AgentMessages from '@/features/agent/dashboard/components/AgentMessages';
import Messages from '@/features/agent/dashboard/components/Messages';

const page = () => {
  return (
    <div className='w-full'>
      <Messages/>
      {/* <AgentMessages/> */}
    </div>
  )
}

export default page