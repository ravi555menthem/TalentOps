import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare, X } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello! I am your Talent Ops AI assistant. How can I help you with workforce data today?' }
    ]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: 'user', text: input }]);
        setInput('');

        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: "I'm just a demo, but I can pretend to analyze that data for you! 🤖" }]);
        }, 1000);
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '350px',
                    height: '500px',
                    backgroundColor: 'var(--surface)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-lg)',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bot size={20} />
                            <span style={{ fontWeight: 600 }}>AI Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ color: 'white', opacity: 0.8 }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--background)' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    backgroundColor: msg.role === 'ai' ? 'var(--primary)' : 'var(--accent)',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div style={{
                                    maxWidth: '75%',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    backgroundColor: msg.role === 'ai' ? 'var(--surface)' : 'var(--accent)',
                                    color: msg.role === 'ai' ? 'var(--text-main)' : 'white',
                                    boxShadow: 'var(--shadow-sm)',
                                    borderTopLeftRadius: msg.role === 'ai' ? '2px' : '12px',
                                    borderTopRightRadius: msg.role === 'user' ? '2px' : '12px'
                                }}>
                                    <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: '12px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)', display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                width: '40px', height: '40px', borderRadius: '8px',
                                backgroundColor: 'var(--primary)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-lg)',
                    transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </button>

            <style>
                {`
                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </div>
    );
};

export default Chatbot;
