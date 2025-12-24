import React, { useState, useEffect } from "react";
// ⚠️ CHECK: Ensure this path points to your actual Supabase client file
import { supabase } from "../lib/supabaseClient";

const TalentOpsChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);

    // =======================================================
    // ⚠️ ACTION REQUIRED: PASTE YOUR NGROK URL HERE LATER
    // =======================================================
    const API_URL = "https://ungaraged-soony-maricela.ngrok-free.dev/chat";

    // 1. On Mount: Get the logged-in User's ID and Role
    useEffect(() => {
        const getUser = async () => {
            try {
                const session = await supabase.auth.getSession();
                const user = session?.data?.session?.user;

                if (user) {
                    let userRole = "employee";
                    try {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', user.id)
                            .single();
                        if (profile?.role) userRole = profile.role;
                    } catch (err) {
                        console.log("No specific role found, defaulting to employee");
                    }
                    console.log("Chatbot: User found", user.id);
                    setUserData({ id: user.id, role: userRole });
                } else {
                    console.log("Chatbot: No user logged in");
                }
            } catch (error) {
                console.error("Chatbot Auth Error:", error);
            }
        };
        getUser();
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Add User Message to UI
        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            if (!userData) {
                setMessages([...newMessages, { sender: "bot", text: "⚠️ You must be logged in to chat." }]);
                setLoading(false);
                return;
            }

            // 2. Send Data to Python Backend
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: newMessages[newMessages.length - 1].text,
                    user_id: userData.id,   // <--- Sends User ID (UUID)
                    role: userData.role     // <--- Sends User Role
                }),
            });

            const data = await response.json();

            // Add Bot Response to UI
            setMessages([...newMessages, { sender: "bot", text: data.response }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages([...newMessages, { sender: "bot", text: "❌ Connection Error. Is the backend running?" }]);
        }
        setLoading(false);
    };

    // Don't render anything if user is not logged in (Commented out for testing)
    // if (!userData) return null;

    return (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999, fontFamily: "sans-serif" }}>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: "60px", height: "60px", borderRadius: "50%",
                        background: "#2563EB", color: "white", border: "none",
                        fontSize: "28px", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                    }}
                >
                    💬
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: "350px", height: "500px", background: "white",
                    borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    display: "flex", flexDirection: "column", border: "1px solid #ddd", overflow: "hidden"
                }}>

                    {/* Header */}
                    <div style={{
                        padding: "15px", background: "#2563EB", color: "white",
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                        <div>
                            <div style={{ fontWeight: "bold", fontSize: "16px" }}>TalentOps AI</div>
                            <div style={{ fontSize: "12px", opacity: 0.8 }}>{(userData?.role || "guest").toUpperCase()} ACCESS</div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "white", fontSize: "18px", cursor: "pointer" }}>✕</button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: "15px", overflowY: "auto", background: "#F3F4F6" }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ marginBottom: "10px", textAlign: msg.sender === "user" ? "right" : "left" }}>
                                <div style={{
                                    display: "inline-block",
                                    padding: "10px 14px",
                                    borderRadius: "16px",
                                    background: msg.sender === "user" ? "#2563EB" : "#E5E7EB",
                                    color: msg.sender === "user" ? "white" : "#1F2937",
                                    maxWidth: "80%", fontSize: "14px", lineHeight: "1.4"
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && <div style={{ fontSize: "12px", color: "#6B7280", marginLeft: "10px" }}>Thinking...</div>}
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: "12px", borderTop: "1px solid #E5E7EB", display: "flex", background: "white" }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Ask me to apply leave, assign task..."
                            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB", outline: "none", marginRight: "8px" }}
                        />
                        <button onClick={sendMessage} style={{ background: "#2563EB", color: "white", border: "none", padding: "0 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TalentOpsChatbot;
