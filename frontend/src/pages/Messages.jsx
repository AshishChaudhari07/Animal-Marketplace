import { useState, useEffect, useRef } from 'react';
import apiClient from '../apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaPaw } from 'react-icons/fa';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message (disabled)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll disabled to avoid interrupting user's manual scroll.
  // Previously this automatically scrolled when `messages` or `isTyping` changed:
  // useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await apiClient.get('/api/messages/conversations');
      setConversations(response.data);
      if (response.data.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data[0].conversationId);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    try {
      const response = await apiClient.get(`/api/messages/conversation/${selectedConversation}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations.find(c => c.conversationId === selectedConversation);
    if (!conversation) return;

    try {
      // Simulate typing indicator on receiver's side
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);

      await apiClient.post('/api/messages', {
        receiverId: conversation.otherUser._id,
        animalId: conversation.animal._id,
        message: newMessage,
        conversationId: selectedConversation
      });
      setNewMessage('');
      fetchMessages();
      fetchConversations();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  // Determine user role (Buyer or Seller)
  const getUserRole = (conversation) => {
    // If user is the animal owner, they're the Seller
    if (conversation.animal.sellerId === user._id) {
      return 'Seller';
    }
    return 'Buyer';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.conversationId}
                    onClick={() => setSelectedConversation(conv.conversationId)}
                    className={`p-4 border-b cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-md ${
                      selectedConversation === conv.conversationId
                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                        {conv.otherUser.avatar ? (
                          <img
                            src={conv.otherUser.avatar}
                            alt={conv.otherUser.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>{conv.otherUser.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{conv.otherUser.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessage.message}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header with Animal Thumbnail and Role Label */}
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  {(() => {
                    const conv = conversations.find(c => c.conversationId === selectedConversation);
                    return conv ? (
                      <div className="flex items-center gap-4">
                        {/* Animal Thumbnail */}
                        <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-blue-200">
                          {conv.animal.images && conv.animal.images.length > 0 ? (
                            <img
                              src={conv.animal.images[0]}
                              alt={conv.animal.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaPaw className="text-blue-600 text-xl" />
                          )}
                        </div>
                        {/* User Info and Role */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">{conv.otherUser.name}</p>
                            <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                              {getUserRole(conv)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">{conv.animal.title}</p>
                        </div>
                        {/* User Avatar */}
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                          {conv.otherUser.avatar ? (
                            <img
                              src={conv.otherUser.avatar}
                              alt={conv.otherUser.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span>{conv.otherUser.name.charAt(0)}</span>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px] bg-gradient-to-b from-white to-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.sender._id === user._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 ${
                          msg.sender._id === user._id
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender._id === user._id
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl rounded-bl-none bg-gray-200 text-gray-800">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;


