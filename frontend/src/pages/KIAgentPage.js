import React, { useState, useEffect, useRef } from "react";

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

function KIAgentPage() {
  const STORAGE_KEY = "ki-agent-conversations";

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");

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

  const activeConversation =
    conversations.find((c) => c.id === activeId) || null;

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

  // >>>>>>>>>>>>>>>  自动命名逻辑已整合在这里  <<<<<<<<<<<<<<<<
  const handleSend = () => {
    if (!input.trim() || !activeConversation) return;

    const firstUserMessage = input.trim();

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: firstUserMessage,
      createdAt: new Date().toISOString(),
    };

    const fakeReply = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Dies ist eine Beispielantwort. Hier wird später die echte Antwort des KI-Agents angezeigt.",
      createdAt: new Date().toISOString(),
    };

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
          messages: [...conv.messages, userMessage, fakeReply],
        };
      })
    );

    setInput("");
  };
  // >>>>>>>>>>>>>>>  handleSend 结束  <<<<<<<<<<<<<<<<

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
    <section className="page-section" style={{ marginTop: "40px" }}>
      <h1>KI Agent</h1>

      <div
        className="content-box"
        style={{
          display: "flex",
          gap: "20px",
          minHeight: "85vh",
        }}
      >
        {/* Linke Spalte: Chat-Historie */}
        <div
          style={{
            flexBasis: "30%",
            maxWidth: "30%",
            background: "#f7f7f8",
            borderRight: "1px solid #e0e0e0",
            padding: "10px",
            overflowY: "auto",
          }}
        >
          <button
            onClick={handleNewChat}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              cursor: "pointer",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "white",
              fontSize: "13px",
            }}
          >
            Neuer Chat +
          </button>

          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              style={{
                padding: "8px",
                cursor: "pointer",
                background: conv.id === activeId ? "#e6e6e7" : "transparent",
                borderRadius: "8px",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "6px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: "13px" }}>
                  {conv.title || "Unbenannter Chat"}
                </strong>
                <div style={{ fontSize: "10px", color: "#777" }}>
                  {new Date(conv.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conv.id);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Rechte Spalte: Chat-Bereich */}
        <div
          style={{
            flexBasis: "70%",
            maxWidth: "70%",
            display: "flex",
            flexDirection: "column",
            paddingTop: "20px",
          }}
        >
          {/* Nachrichtenliste inkl. Willkommensbereich */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid#ddd",
              padding: "14px",
              marginBottom: "26px",
              borderRadius: "10px",
              background: "white",
            }}
          >
            {showWelcome ? (
              <div
                style={{
                  background: "#fafafa",
                  borderRadius: "10px",
                  padding: "16px",
                  border: "1px solid #eee",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <AgentAvatarIcon size={32} />
                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.4",
                      color: "#333",
                    }}
                  >
                    Willkommen beim KI Agent für Portfolio-Analysen. Stell mir
                    eine Frage oder wähle einen Vorschlag unten.
                  </div>
                </div>

                <div style={{ marginLeft: "42px", fontSize: "13px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                    Häufige Fragen:
                  </div>
                  <ul style={{ paddingLeft: "16px", margin: 0 }}>
                    <li>Wie hoch ist das Risiko meines Portfolios?</li>
                    <li>
                      Bitte interpretiere die wichtigsten Kennzahlen meines
                      Portfolios.
                    </li>
                    <li>
                      Welche Strategie-Empfehlungen hast du für dieses
                      Portfolio?
                    </li>
                    <li>
                      Erkläre mir Rendite, Volatilität und Sharpe Ratio in
                      einfachen Worten.
                    </li>
                  </ul>
                </div>
              </div>
            ) : activeConversation && activeConversation.messages.length > 0 ? (
              activeConversation.messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: isUser ? "row-reverse" : "row",
                      alignItems: "flex-start",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      {isUser ? (
                        <UserAvatarIcon size={32} />
                      ) : (
                        <AgentAvatarIcon size={32} />
                      )}
                    </div>

                    <div
                      style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        background: isUser ? "#007bff" : "#f3f3f3",
                        color: isUser ? "white" : "#111",
                        maxWidth: "80%",
                        fontSize: "14px",
                        lineHeight: "1.4",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          {/* Schnellbefehle */}
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {quickPrompts.map((p) => (
              <button
                key={p.label}
                onClick={() =>
                  setInput((prev) => (prev ? prev + " " + p.text : p.text))
                }
                style={{
                  fontSize: "12px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: "1px solid #d0d0d0",
                  background: "#f8f8f8",
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Eingabebereich */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
              paddingBottom: "8px",
            }}
          >
            <textarea
              style={{
                flex: 1,
                resize: "none",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
              rows={2}
              placeholder="Gib hier deine Nachricht ein..."
              value={input}
              onKeyDown={handleKeyDown}
              onChange={(e) => setInput(e.target.value)}
            ></textarea>

            <button
              style={{
                padding: "12px 22px",
                borderRadius: "8px",
                background: "#007bff",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                border: "none",
                whiteSpace: "nowrap",
              }}
              onClick={handleSend}
            >
              Senden
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default KIAgentPage;
