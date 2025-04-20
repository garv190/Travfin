import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatInterface = () => {
  const [state, setState] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [botMessage, setBotMessage] = useState('');
  const messagesEndRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (state?.messages) scrollToBottom();
  }, [state?.messages]);

  useEffect(() => {
    const savedState = localStorage.getItem('chatState');
    const savedBotMessage = localStorage.getItem('botMessage');

    if (savedState) setState(JSON.parse(savedState));
    if (savedBotMessage) setBotMessage(savedBotMessage);
  }, []);

  useEffect(() => {
    if (state) localStorage.setItem('chatState', JSON.stringify(state));
    if (botMessage) localStorage.setItem('botMessage', botMessage);
  }, [state, botMessage]);

  const startChat = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/init`);
      const initMessages = response.data.state.messages || [
        { type: 'bot', content: response.data.message },
      ];

      setState({
        ...response.data.state,
        messages: initMessages,
      });

      setBotMessage(response.data.message);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Failed to start chat. Please check your backend connection.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    const updatedMessages = [
      ...(state.messages || []),
      { type: 'user', content: input },
    ];

    try {
      const response = await axios.post(`${API_URL}/update`, {
        state,
        user_input: input,
      });

      const botMessageContent = response.data.message;
      setBotMessage(botMessageContent);

      setState({
        ...response.data.state,
        messages: [
          ...updatedMessages,
          { type: 'bot', content: botMessageContent },
        ],
      });

      setInput('');
    } catch (error) {
      console.error('Error updating chat:', error);
      setError('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  const resetChat = () => {
    localStorage.removeItem('chatState');
    localStorage.removeItem('botMessage');
    setState(null);
    setBotMessage('');
    setInput('');
    setError(null);
  };

  const getPlaceholderText = () => {
    if (!state) return 'Enter message...';
    switch (state.current_step) {
      case 'city':
        return 'Enter the city you want to visit...';
      case 'interests':
        return 'Enter your interests (museums, food, hiking)...';
      case 'trip_dates':
        return 'Enter start date and duration (e.g., 2025-05-15 for 7 days)...';
      case 'complete':
        return 'Ask questions about your trip...';
      default:
        return 'Enter message...';
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-screen p-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      {!state ? (
        <div className="text-center mt-16 flex flex-col items-center justify-center flex-grow">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Travel Planner</h2>
          <p className="text-gray-600 mb-8">Let's plan your next adventure together!</p>
          <button
            onClick={startChat}
            disabled={loading}
            className={`px-6 py-3 rounded-full font-medium text-white ${
              loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300`}
          >
            {loading ? 'Starting...' : 'Start Planning'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Travel Planner</h2>
            <button
              onClick={resetChat}
              className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              New Trip
            </button>
          </div>

          <div className="flex-grow border border-gray-200 rounded-lg bg-white mb-4 overflow-hidden flex flex-col">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {state.messages &&
                state.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.type === 'user'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-gray-200 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {state.itinerary && (
            <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                Your Itinerary
              </h3>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {state.itinerary.split('\n').map((line, index) => (
                  <div key={index} className="mb-1">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={getPlaceholderText()}
              className="flex-grow px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`px-6 py-3 rounded-full font-medium text-white ${
                loading || !input.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300`}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
