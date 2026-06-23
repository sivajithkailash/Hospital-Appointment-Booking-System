import React from 'react';
import { MessageSquare, Search, User, Send } from 'lucide-react';

export default function Messages() {
  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search chats..."
              className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 w-full text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[1,2,3].map(i => (
            <div key={i} className="p-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                D{i}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 text-sm truncate">Dr. Smith</h3>
                  <span className="text-[10px] text-gray-400">12:30 PM</span>
                </div>
                <p className="text-xs text-gray-500 truncate">Your lab results are ready for review...</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              DS
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Dr. Smith</h3>
              <p className="text-[10px] text-green-500 font-bold uppercase">Online</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-md">
              <p className="text-sm text-gray-700">Hello! I've reviewed your recent lab reports. Everything looks normal, but I'd like to discuss the vitamin levels.</p>
              <span className="text-[10px] text-gray-400 mt-2 block">12:30 PM</span>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-lg shadow-blue-100 max-w-md text-white">
              <p className="text-sm">Thank you, Doctor. When would be a good time for a quick call?</p>
              <span className="text-[10px] text-blue-200 mt-2 block">12:35 PM</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2">
            <input 
              type="text"
              placeholder="Type your message..."
              className="flex-1 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
