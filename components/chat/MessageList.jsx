// import React, { useRef, useEffect } from 'react';
// import VoiceMessage from './VoiceMessage';

// const MessageList = ({ messages }) => {
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   return (
//     <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
//       {messages.map(message => (
//         <div
//           key={message.id}
//           className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
//         >
//           {message.type === 'image' ? (
//             <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md ${message.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
//               <div className={`grid ${message.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1`}>
//                 {message.images.map((img, idx) => (
//                   <img
//                     key={idx}
//                     src={img}
//                     alt="Shared"
//                     className="rounded-2xl max-h-48 sm:max-h-64 object-cover"
//                   />
//                 ))}
//               </div>
//               {message.text && (
//                 <div className={`px-3 sm:px-4 py-2 rounded-3xl ${message.sender === 'me'
//                   ? 'bg-[#2755ff] text-white'
//                   : 'bg-gray-200 text-gray-900'
//                   }`}>
//                   <p className="text-sm">{message.text}</p>
//                 </div>
//               )}
//               <p className="text-xs px-2 text-gray-500">
//                 {message.time}
//               </p>
//             </div>
//           ) : message.type === 'voice' ? (
//             <div className="flex flex-col gap-1">
//               <VoiceMessage audioUrl={message.audioUrl} duration={message.duration} sender={message.sender} />
//               <p className={`text-xs px-2 ${message.sender === 'me' ? 'text-gray-500 text-right' : 'text-gray-500'
//                 }`}>
//                 {message.time}
//               </p>
//             </div>
//           ) : (
//             <div
//               className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-3xl ${message.sender === 'me'
//                 ? 'bg-[#2755ff] text-white'
//                 : 'bg-gray-200 text-gray-900'
//                 }`}
//             >
//               <p className="text-sm">{message.text}</p>
//               <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
//                 }`}>
//                 {message.time}
//               </p>
//             </div>
//           )}
//         </div>
//       ))}
//       <div ref={messagesEndRef} />
//     </div>
//   );
// };

// export default MessageList;

import React, { useRef, useEffect, useState } from 'react';
import VoiceMessage from './VoiceMessage';
import ImageModal from './ImageModal';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);
  const [modalImages, setModalImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const openImageModal = (images, index) => {
    setModalImages(images);
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImages([]);
    setCurrentImageIndex(0);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'image' ? (
              <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md ${message.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {/* Single Image */}
                {message.images.length === 1 ? (
                  <div
                    onClick={() => openImageModal(message.images, 0)}
                    className="cursor-pointer relative group"
                  >
                    <img
                      src={message.images[0]}
                      alt="Shared"
                      className="rounded-2xl max-h-64 sm:max-h-80 object-cover w-full"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition rounded-2xl"></div>
                  </div>
                ) : message.images.length === 2 ? (
                  /* Two Images - Side by Side */
                  <div className="grid grid-cols-2 gap-1">
                    {message.images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => openImageModal(message.images, idx)}
                        className="cursor-pointer relative group"
                      >
                        <img
                          src={img}
                          alt="Shared"
                          className="rounded-xl h-48 sm:h-56 object-cover w-full"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                ) : message.images.length === 3 ? (
                  /* Three Images - 1 Large + 2 Small */
                  <div className="grid grid-cols-2 gap-1">
                    <div
                      onClick={() => openImageModal(message.images, 0)}
                      className="col-span-2 cursor-pointer relative group"
                    >
                      <img
                        src={message.images[0]}
                        alt="Shared"
                        className="rounded-xl h-48 sm:h-56 object-cover w-full"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition rounded-xl"></div>
                    </div>
                    {message.images.slice(1).map((img, idx) => (
                      <div
                        key={idx + 1}
                        onClick={() => openImageModal(message.images, idx + 1)}
                        className="cursor-pointer relative group"
                      >
                        <img
                          src={img}
                          alt="Shared"
                          className="rounded-xl h-32 sm:h-40 object-cover w-full"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                ) : message.images.length === 4 ? (
                  /* Four Images - 2x2 Grid */
                  <div className="grid grid-cols-2 gap-1">
                    {message.images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => openImageModal(message.images, idx)}
                        className="cursor-pointer relative group"
                      >
                        <img
                          src={img}
                          alt="Shared"
                          className="rounded-xl h-40 sm:h-48 object-cover w-full"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* 5+ Images - 2 Large + More Badge */
                  <div className="grid grid-cols-2 gap-1">
                    {message.images.slice(0, 4).map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => openImageModal(message.images, idx)}
                        className="cursor-pointer relative group"
                      >
                        <img
                          src={img}
                          alt="Shared"
                          className="rounded-xl h-40 sm:h-48 object-cover w-full"
                        />
                        {idx === 3 && message.images.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                            <span className="text-white text-2xl font-semibold">
                              +{message.images.length - 4}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                )}

                {message.text && (
                  <div className={`px-3 sm:px-4 py-2 rounded-3xl ${message.sender === 'me'
                    ? 'bg-[#2755ff] text-white'
                    : 'bg-gray-200 text-gray-900'
                    }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                )}
                <p className="text-xs px-2 text-gray-500">
                  {message.time}
                </p>
              </div>
            ) : message.type === 'voice' ? (
              <div className="flex flex-col gap-1">
                <VoiceMessage audioUrl={message.audioUrl} duration={message.duration} sender={message.sender} />
                <p className={`text-xs px-2 ${message.sender === 'me' ? 'text-gray-500 text-right' : 'text-gray-500'
                  }`}>
                  {message.time}
                </p>
              </div>
            ) : (
              <div
                className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-3xl ${message.sender === 'me'
                  ? 'bg-[#2755ff] text-white'
                  : 'bg-gray-200 text-gray-900'
                  }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                  {message.time}
                </p>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <ImageModal
          images={modalImages}
          currentIndex={currentImageIndex}
          onClose={closeModal}
          onIndexChange={setCurrentImageIndex}
        />
      )}
    </>
  );
};

export default MessageList;