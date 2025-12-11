import React from 'react';
import { Message, AgentType } from '../types';
import { User, Bot, ServerCog } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isTool = message.role === 'system_tool';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center shrink-0
          ${isUser ? 'bg-indigo-600 text-white' : isTool ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}
        `}>
          {isUser ? <User size={16} /> : isTool ? <ServerCog size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          
          {/* Sender Name */}
          <span className="text-xs text-slate-400 mb-1 ml-1 mr-1">
            {isUser ? 'Anda' : isTool ? `Sub-Agen: ${message.agent}` : 'Koordinator Pusat'}
          </span>

          {/* Content Card */}
          <div className={`
            p-4 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : isTool
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-tl-none'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}
          `}>
            
            {/* If it's a tool response, we can style the metadata nicely */}
            {isTool && message.metadata && (
              <div className="mb-2 pb-2 border-b border-emerald-200/50 text-xs font-mono text-emerald-700">
                <div className="font-bold mb-1">Function Call: {message.agent}</div>
                <pre className="whitespace-pre-wrap">{JSON.stringify(message.metadata, null, 2)}</pre>
              </div>
            )}
            
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
          
          {/* Time */}
          <span className="text-[10px] text-slate-300 mt-1 mx-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;