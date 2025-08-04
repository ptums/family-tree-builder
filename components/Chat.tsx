"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FamilyNode {
  id: string;
  name: string;
  birth?: string;
  birthLocation?: string;
  death?: string;
  deathLocation?: string;
  fatherId?: string | null;
  motherId?: string | null;
  occupation?: string;
  gender?: "male" | "female";
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm your family tree assistant. I can help you create and manage family members. You can ask me to:\n\n• Create a new family member\n• Search for existing family members\n• Get AI suggestions for family relationships\n• Validate family data\n\nWhat would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, type: "user" | "assistant") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const callChatAPI = async (message: string, action?: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, action }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error calling chat API:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput("");
    addMessage(userInput, "user");
    setIsLoading(true);

    try {
      // Simple command parsing
      const lowerInput = userInput.toLowerCase();

      if (lowerInput.includes("create") || lowerInput.includes("add")) {
        // Use AI to suggest family node creation
        const response = await callChatAPI(userInput, "create");
        
        if (response.type === "creation_suggestion") {
          const suggestion = response.data;
          addMessage(
            `${response.message}\n\n` +
            `**Name:** ${suggestion.name || "Unknown"}\n` +
            `**Birth:** ${suggestion.birth || "Unknown"}\n` +
            `**Birth Location:** ${suggestion.birthLocation || "Unknown"}\n` +
            `**Death:** ${suggestion.death || "Unknown"}\n` +
            `**Death Location:** ${suggestion.deathLocation || "Unknown"}\n` +
            `**Occupation:** ${suggestion.occupation || "Unknown"}\n` +
            `**Gender:** ${suggestion.gender || "Unknown"}\n\n` +
            `Would you like me to create this family member? Type "yes" to confirm or provide more details.`,
            "assistant"
          );
        } else {
          addMessage(response.message, "assistant");
        }
      } else if (lowerInput.includes("search") || lowerInput.includes("find")) {
        // Search for family members
        const response = await callChatAPI(userInput, "search");
        
        if (response.type === "search_results") {
          if (response.data.length > 0) {
            const resultsText = response.data
              .map((node: FamilyNode) => 
                `• **${node.name}** (${node.birth || "Unknown"} - ${node.death || "Present"})`
              )
              .join("\n");
            addMessage(`${response.message}\n\n${resultsText}`, "assistant");
          } else {
            addMessage(response.message, "assistant");
          }
        } else {
          addMessage(response.message, "assistant");
        }
      } else if (lowerInput.includes("list") || lowerInput.includes("show all")) {
        // List all family members
        const response = await callChatAPI(userInput, "list");
        
        if (response.type === "list_results") {
          if (response.data.length > 0) {
            const nodesText = response.data
              .map((node: FamilyNode) => 
                `• **${node.name}** (${node.birth || "Unknown"} - ${node.death || "Present"})`
              )
              .join("\n");
            addMessage(`${response.message}\n\n${nodesText}`, "assistant");
          } else {
            addMessage(response.message, "assistant");
          }
        } else {
          addMessage(response.message, "assistant");
        }
      } else if (lowerInput === "yes" || lowerInput.includes("confirm")) {
        // Create the family member (this would need to be enhanced to remember the previous suggestion)
        addMessage("I'll create the family member for you. Please provide the details again or use a more specific command like 'create John Smith born 1980'", "assistant");
      } else if (lowerInput.includes("help")) {
        addMessage(
          "Here are the commands I understand:\n\n" +
          "• **Create/Add** - Create a new family member (e.g., 'create John Smith born 1980')\n" +
          "• **Search/Find** - Search for family members (e.g., 'search John Smith')\n" +
          "• **List/Show all** - Show all family members\n" +
          "• **Help** - Show this help message\n\n" +
          "You can also ask me natural language questions about your family tree!",
          "assistant"
        );
      } else {
        // Try to get AI suggestions for relationships
        const response = await callChatAPI(userInput, "suggest_relationships");
        
        if (response.type === "relationship_suggestions") {
          if (response.data.length > 0) {
            const suggestionsText = response.data
              .map((s: any) => `• **${s.name}** - ${s.relationship} (${s.confidence} confidence)`)
              .join("\n");
            addMessage(`${response.message}\n\n${suggestionsText}`, "assistant");
          } else {
            addMessage(`${response.message}\n\nNo relationships found.`, "assistant");
          }
        } else {
          addMessage(response.message, "assistant");
        }
      }
    } catch (error) {
      addMessage(
        "Sorry, I encountered an error while processing your request. Please try again.",
        "assistant"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-lg border">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your family tree..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
