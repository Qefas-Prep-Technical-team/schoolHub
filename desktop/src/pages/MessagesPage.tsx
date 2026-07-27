import React, { useEffect, useState } from "react";
import { Send, FileText, CheckCircle } from "lucide-react";
import { MessageRepository, DraftRepository } from "../repositories";
import { MessageRecord, DraftRecord } from "../types/database";

export const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [content, setContent] = useState("");
  const [draft, setDraft] = useState<DraftRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const msgRepo = new MessageRepository();
  const draftRepo = new DraftRepository();

  const currentUserId = "user_admin_01";
  const recipientId = "teacher_02";

  const loadMessagesAndDrafts = async () => {
    const records = await msgRepo.getConversation(currentUserId, recipientId);
    setMessages(records);

    const activeDraft = await draftRepo.getDraft(currentUserId, "message");
    if (activeDraft) {
      setDraft(activeDraft);
      if (!content) {
        setContent(activeDraft.body);
      }
    }
  };

  useEffect(() => {
    loadMessagesAndDrafts();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await msgRepo.create({
      senderId: currentUserId,
      receiverId: recipientId,
      content: content.trim(),
      isRead: 0,
    });

    // Clear saved draft
    if (draft) {
      await draftRepo.softDelete(draft.id);
      setDraft(null);
    }

    setContent("");
    setStatusMessage("Message saved locally to SQLite & queued for sync!");
    setTimeout(() => setStatusMessage(""), 3000);
    await loadMessagesAndDrafts();
  };

  const handleSaveDraft = async () => {
    if (!content.trim()) return;
    const saved = await draftRepo.saveDraft(currentUserId, "message", content.trim(), "Draft Message");
    setDraft(saved);
    setStatusMessage("Draft auto-saved to local SQLite!");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Messages & Drafts Engine</h1>
        <p className="text-xs text-slate-400 mt-1">
          Compose chats offline. All drafts and messages are persisted in SQLite instantly.
        </p>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-950/80 border border-emerald-800 p-3 text-xs text-emerald-300">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Message Feed */}
        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col h-[480px]">
          <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200">Conversation with Teacher Desk</h3>
            <span className="text-[10px] text-slate-500 font-mono">Recipient: {recipientId}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-12">No local messages recorded.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] rounded-xl p-3 text-xs ${
                    msg.senderId === currentUserId
                      ? "ml-auto bg-indigo-600/20 border border-indigo-500/30 text-indigo-100"
                      : "mr-auto bg-slate-800 text-slate-200"
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className="text-[9px] opacity-60 text-right mt-1 font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString()} • {msg.syncStatus}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Composer */}
          <form onSubmit={handleSend} className="mt-4 border-t border-slate-800 pt-3 flex gap-2">
            <input
              type="text"
              placeholder="Type message offline..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveDraft}
              className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:text-slate-200"
              title="Save Draft"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 flex items-center gap-1.5 shadow"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Drafts Sidebar */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-200">Active Drafts</h3>
          {draft ? (
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                <span>{draft.title || "Draft Message"}</span>
                <span className="text-[9px] font-mono text-indigo-400">{draft.syncStatus}</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-3">{draft.body}</p>
              <button
                onClick={() => setContent(draft.body)}
                className="text-[10px] font-semibold text-indigo-400 hover:underline"
              >
                Load into editor
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No pending drafts.</p>
          )}
        </div>
      </div>
    </div>
  );
};
