// Chat interface component for project communication
// Real-time messaging between gestionnaires and artisans

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, Clock, Loader2 } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ChatInterfaceProps {
  projectId: string;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ projectId, className }) => {
  const { user } = useAuthStore();
  const { sendMessage, getMessagesByProject, markMessagesAsRead, loadMessagesByProject, isLoading } = useProjectStore();
  
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = getMessagesByProject(projectId);

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        await loadMessagesByProject(projectId);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [projectId, loadMessagesByProject]);

  useEffect(() => {
    if (user) {
      markMessagesAsRead(projectId, user.id);
    }
  }, [projectId, user, markMessagesAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (!user) return;

    await sendMessage(
      projectId,
      user.id,
      `${user.firstName} ${user.lastName}`,
      message,
      attachments.length > 0 ? attachments : undefined
    );
    
    setMessage('');
    setAttachments([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    }
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long'
    }).format(messageDate);
  };

  let lastDate = '';

  return (
    <div className={`flex flex-col h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Discussion du projet
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Communication en temps réel
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Chargement des messages...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Aucun message pour le moment
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Commencez la conversation !
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const messageDate = formatDate(msg.timestamp);
            const showDateSeparator = messageDate !== lastDate;
            lastDate = messageDate;
            
            const isOwnMessage = user?.id === msg.senderId;
            
            return (
              <div key={msg.id}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {messageDate}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    {!isOwnMessage && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-3">
                        {msg.senderName}
                      </p>
                    )}
                    
                    <div className={`rounded-lg px-3 py-2 ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      {msg.message && (
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      )}
                      
                      {msg.photos && msg.photos.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {msg.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex items-center mt-1 space-x-1 ${
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}>
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(msg.timestamp)}
                      </span>
                      {!msg.isRead && !isOwnMessage && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Attachment ${index + 1}`}
                  className="w-16 h-16 object-cover rounded border"
                />
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex space-x-1">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="chat-file-input"
            />
            <label htmlFor="chat-file-input">
              <Button variant="ghost" size="sm" className="p-2" type="button">
                <Image className="h-4 w-4" />
              </Button>
            </label>
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() && attachments.length === 0}
              isLoading={isLoading}
              size="sm"
              className="p-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};