import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "../styles/chat.css";

function UserAvatarIcon({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="20" fill="#F2F3F5" />
      <circle cx="20" cy="15" r="6" fill="#9AA0A6" />
      <path
        d="M20 23C14.5 23 10 26.5 10 31C10 31.6 10.4 32 11 32H29C29.6 32 30 31.6 30 31C30 26.5 25.5 23 20 23Z"
        fill="#9AA0A6"
      />
    </svg>
  );
}

function AgentAvatarIcon({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="20" fill="#111111" />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontWeight="700"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      >
        D
      </text>
      <circle cx="30" cy="28" r="3" fill="#8BC34A" />
    </svg>
  );
}

// Helper to normalize LaTeX delimiters
const preprocessContentForMarkdown = (content) => {
  if (!content) return "";
  return content
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");
};

function Typewriter({ content, onComplete }) {
  const [displayedContent, setDisplayedContent] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset if content changes unexpectedly
    setDisplayedContent("");
    indexRef.current = 0;
  }, [content]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedContent((prev) => {
        if (indexRef.current >= content.length) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return prev;
        }
        const nextChar = content.charAt(indexRef.current);
        indexRef.current++;
        return prev + nextChar;
      });
    }, 15); // Speed: 15ms per character

    return () => clearInterval(interval);
  }, [content, onComplete]);

  // Preprocess for display
  const cleaned = preprocessContentForMarkdown(displayedContent);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    // Remove the custom 'p' component that was stripping margins.
    // Let our CSS handle the spacing.
    >
      {cleaned}
    </ReactMarkdown>
  );
}

function KIAgentPage({ initialInput = "" }) {
  const STORAGE_KEY = "ki-agent-conversations";

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState(initialInput); // Initialize with prop

  // Track if we have already auto-sent to prevent double sending on re-renders
  const hasAutoSentRef = useRef(false);

  const messagesEndRef = useRef(null);

  const quickPrompts = [
    {
      label: "Interpretieren",
      text: "Bitte interpretiere die obigen Ergebnisse des Portfolios.",
    },
    {
      label: "Zusammenfassen",
      text: "Bitte fasse die wichtigsten Erkenntnisse aus dieser Analyse kurz zusammen.",
    },
    {
      label: "Risiko analysieren",
      text: "Bitte analysiere die wesentlichen Risiken dieses Portfolios.",
    },
    {
      label: "Strategie-Vorschlag",
      text: "Bitte gib einen kurzen Vorschlag, wie das Portfolio strategisch verbessert werden kann.",
    },
  ];

  // Load Conversations
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveId(parsed[0].id);
        }
      } catch (e) {
        console.error("Fehler beim Lesen der gespeicherten Chats:", e);
      }
    } else {
      const first = {
        id: crypto.randomUUID(),
        title: "Neuer Chat",
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setConversations([first]);
      setActiveId(first.id);
    }
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeId) || null;

  // Auto-Send Logic
  useEffect(() => {
    if (initialInput && activeConversation && !hasAutoSentRef.current) {
      hasAutoSentRef.current = true;
      handleSend(initialInput);
    }
  }, [initialInput, activeConversation]);


  // Chats in localStorage speichern
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations, activeId]);


  const handleNewChat = () => {
    const newConv = {
      id: crypto.randomUUID(),
      title: "Neuer Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setInput("");
  };

  const handleDeleteConversation = (id) => {
    setConversations((prev) => {
      let filtered = prev.filter((c) => c.id !== id);
      let newActive = activeId;

      if (id === activeId) {
        if (filtered.length > 0) {
          newActive = filtered[0].id;
        } else {
          const first = {
            id: crypto.randomUUID(),
            title: "Neuer Chat",
            messages: [],
            createdAt: new Date().toISOString(),
          };
          filtered = [first];
          newActive = first.id;
        }
      }

      setActiveId(newActive);
      return filtered;
    });
  };

  // >>>>>>>>>>>>>>>  Real Backend Connection  <<<<<<<<<<<<<<<<
  // Modified to accept optional explicit content override (for auto-send)
  const handleSend = async (overrideContent) => {
    // If overrideContent is present, use it. Otherwise use input state.
    const textToSend = typeof overrideContent === 'string' ? overrideContent : input;

    if (!textToSend.trim() || !activeConversation) return;

    const firstUserMessage = textToSend.trim();
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: firstUserMessage,
      createdAt: new Date().toISOString(),
    };

    // 1. Optimistic UI update: Show user message immediately
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== activeConversation.id) return conv;

        const isFirstMessage = conv.messages.length === 0;
        let newTitle = conv.title;

        if (isFirstMessage) {
          const words = firstUserMessage.split(/\s+/);
          const short = words.slice(0, 5).join(" ");
          newTitle =
            short.length > 30 ? short.substring(0, 30).trim() + "…" : short;
        }

        return {
          ...conv,
          title: newTitle,
          messages: [...conv.messages, userMessage],
        };
      })
    );

    setInput(""); // Clear input

    // 2. Prepare payload (send relevant history + new message)
    // We send the entire history of the current conversation to give context
    const currentMessages = activeConversation.messages;
    const apiPayload = [
      ...currentMessages.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: firstUserMessage }
    ];

    try {
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiPayload })
      });

      if (!response.ok) {
        throw new Error(`Fehler: ${response.statusText}`);
      }

      const data = await response.json();

      // 3. Update UI with real agent response
      const agentMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content, // Expecting { role: "assistant", content: "..." }
        createdAt: new Date().toISOString(),
        animate: true,
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== activeConversation.id) return conv;
          return {
            ...conv,
            messages: [...conv.messages, agentMessage],
          };
        })
      );

    } catch (error) {
      console.error("Chat Error:", error);
      // Add error message to chat
      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Entschuldigung, es gab einen Fehler bei der Kommunikation mit dem KI-Agenten.",
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== activeConversation.id) return conv;
          return {
            ...conv,
            messages: [...conv.messages, errorMessage],
          };
        })
      );
    }
  };
  // >>>>>>>>>>>>>>>  handleSend End  <<<<<<<<<<<<<<<<

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showWelcome =
    activeConversation &&
    activeConversation.messages.length === 0 &&
    input.trim() === "";

  return (
    <div className="chat-layout">
      {/* Linke Spalte: Chat-Historie */}
      <aside className="chat-sidebar">
        <button className="btn-new-chat" onClick={handleNewChat}>
          <span>+</span> Neuer Chat
        </button>

        <div className="chat-history-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`history-item ${conv.id === activeId ? "active" : ""}`}
              onClick={() => setActiveId(conv.id)}
            >
              <div className="history-info">
                <div className="history-title">
                  {conv.title || "Unbenannter Chat"}
                </div>
                <div className="history-date">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </div>
              </div>

              <button
                className="btn-delete-chat"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conv.id);
                }}
                title="Chat löschen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Rechte Spalte: Hauptbereich */}
      <main className="chat-main">
        {/* Nachrichtenliste */}
        <div className="chat-messages-container">
          {showWelcome ? (
            <div className="welcome-container">
              <div className="welcome-icon">
                <AgentAvatarIcon size={64} />
              </div>
              <h3>Willkommen bei DeloVest AI</h3>
              <p className="welcome-text">
                Ich bin Ihr persönlicher Analyst. Stellen Sie mir Fragen zu Ihrem
                Portfolio, Risiken oder Strategien.
              </p>

              <div className="welcome-faq">
                <h4>Vorschläge</h4>
                <ul>
                  <li>Wie hoch ist das Risiko meines Portfolios?</li>
                  <li>Bitte interpretiere die wichtigsten Kennzahlen.</li>
                  <li>Welche Strategie-Empfehlungen hast du?</li>
                  <li>Erkläre mir Rendite und Volatilität.</li>
                </ul>
              </div>
            </div>
          ) : activeConversation && activeConversation.messages.length > 0 ? (
            activeConversation.messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const isLastMessage = index === activeConversation.messages.length - 1;
              const cleanedContent = preprocessContentForMarkdown(msg.content);

              return (
                <div
                  key={msg.id}
                  className={`message-row ${isUser ? "user-row" : "agent-row"}`}
                >
                  <div className={`avatar ${isUser ? "user-avatar" : "agent-avatar"}`}>
                    {isUser ? <UserAvatarIcon size={20} /> : "D"}
                  </div>
                  <div className="bubble">
                    {msg.animate ? (
                      <Typewriter
                        content={msg.content}
                        onComplete={() => {
                          // Update message to disable animation
                          setConversations((prev) =>
                            prev.map((c) => {
                              if (c.id !== activeConversation.id) return c;
                              return {
                                ...c,
                                messages: c.messages.map((m) =>
                                  m.id === msg.id ? { ...m, animate: false } : m
                                ),
                              };
                            })
                          );
                        }}
                      />
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      // Remove the custom 'p' component that was stripping margins.
                      // Let our CSS handle the spacing.
                      >
                        {preprocessContentForMarkdown(msg.content)}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              );
            })
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="quick-prompts">
            {quickPrompts.map((p) => (
              <button
                key={p.label}
                className="prompt-chip"
                onClick={() =>
                  setInput((prev) => (prev ? prev + " " + p.text : p.text))
                }
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="input-wrapper">
            <textarea
              className="chat-textarea"
              rows={1}
              placeholder="Stellen Sie eine Frage..."
              value={input}
              onKeyDown={handleKeyDown}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              className="btn-submit"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              Senden
            </button>
          </div>
        </div>
      </main >
    </div >
  );
}

export default KIAgentPage;
