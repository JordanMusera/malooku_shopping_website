import Image from 'next/image';
import React, { useState } from 'react';

interface ReplyProps {
  reply: any;
  onReplySubmit: (replyId: string, message: string) => void;
}

const ReplyComponent = ({ reply, onReplySubmit }: ReplyProps) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);

  const handleReplyClick = () => setShowReplyBox(!showReplyBox);

  const handleSubmitReply = () => {
    onReplySubmit(reply._id, replyMessage);
    setReplyMessage('');
    setShowReplyBox(false);
  };

  return (
    <div className='w-full h-max bg-white mt-2 rounded-bl-xl rounded-r-xl p-2'>
      <div className='flex gap-2'>
        <Image src={reply.userDp} width={30} height={30} alt='' className='rounded-full' />
        <div>
          <p className='text-sm font-semibold text-blue-400'>{reply.userName}</p>
          <p className='text-[10px] font-normal text-gray-500'>{reply.date}</p>
        </div>
      </div>
      <p className='text-sm font-normal text-black'>{reply.reply}</p>

      <button onClick={handleReplyClick} className='text-blue-500 text-xs'>Reply</button>

      {showReplyBox && (
        <div className='flex mt-2'>
          <input
            type='text'
            placeholder='Reply here'
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            className='w-full h-8 px-2 rounded-md bg-white text-sm text-black'
          />
          <button onClick={handleSubmitReply} className='text-blue-500'>Send</button>
        </div>
      )}

      <div className='pl-4'>
        {reply.replies?.map((nestedReply:any) => (
          <ReplyComponent key={nestedReply._id} reply={nestedReply} onReplySubmit={onReplySubmit} />
        ))}
      </div>
    </div>
  );
};

export default ReplyComponent;
