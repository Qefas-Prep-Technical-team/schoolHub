"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Send, Plus, Search, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { useSupportTickets, useTicketMessages, useCreateTicket, useSendTicketMessage } from "@/lib/api/hooks/useSupportTickets";
import { useSupportSocket } from "@/lib/hooks/useSupportSocket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

export default function SharedSupportCenter() {
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const { data: tickets, isLoading: ticketsLoading } = useSupportTickets();
  const { data: ticketDetails } = useTicketMessages(activeTicketId || undefined);
  useSupportSocket(activeTicketId || undefined);

  const createTicket = useCreateTicket();
  const sendMessage = useSendTicketMessage();

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    
    if (!subject || !description) return toast.error("Missing fields");

    createTicket.mutate(
      { subject, description, priority },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
        }
      }
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicketId) return;

    sendMessage.mutate(
      { ticketId: activeTicketId, content: newMessage },
      {
        onSuccess: () => setNewMessage("")
      }
    );
  };

  const statusColors: Record<string, string> = {
    OPEN: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    RESOLVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    CLOSED: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  };

  const priorityColors: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-blue-100 text-blue-600",
    HIGH: "bg-orange-100 text-orange-600",
    URGENT: "bg-red-100 text-red-600",
  };

  const filteredTickets = tickets?.filter((t: { subject: string; description: string }) => 
    t.subject?.toLowerCase().includes(search.toLowerCase()) || 
    t.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      
      {/* Left Sidebar: Tickets List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Support</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">My Tickets</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20">
                  <Plus size={18} />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl">
                <div className="p-6 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-slate-900">
                  <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Create New Ticket</DialogTitle>
                    <p className="text-sm text-slate-500">Describe your issue in detail and our team will get back to you.</p>
                  </DialogHeader>
                </div>
                <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Subject</label>
                    <input name="subject" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-indigo-500 outline-none transition-colors" placeholder="Brief summary of the issue" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Description</label>
                    <textarea name="description" rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-indigo-500 outline-none transition-colors resize-none" placeholder="Provide as much detail as possible..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Priority</label>
                    <select name="priority" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 focus:border-indigo-500 outline-none transition-colors">
                      <option value="LOW">Low - General Question</option>
                      <option value="MEDIUM">Medium - Need Assistance</option>
                      <option value="HIGH">High - Issue preventing work</option>
                      <option value="URGENT">Urgent - System down</option>
                    </select>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={createTicket.isPending} className="px-6 py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-full text-base">
                      {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..." 
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {ticketsLoading ? (
            <div className="p-4 text-center text-sm text-slate-500 animate-pulse">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-10">
              <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="text-slate-400" size={20} />
              </div>
              <p className="text-slate-500 text-sm font-medium">No tickets found</p>
            </div>
          ) : (
            filteredTickets.map((ticket: { id: string; status: string; createdAt: string; subject: string; description: string; _count?: { messages: number } }) => (
              <button
                key={ticket.id}
                onClick={() => setActiveTicketId(ticket.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all border",
                  activeTicketId === ticket.id 
                    ? "bg-white dark:bg-slate-800 border-indigo-500/30 shadow-md transform scale-[1.02]" 
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge className={cn("text-[9px] uppercase tracking-wider font-bold border", statusColors[ticket.status])}>
                    {ticket.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-medium">
                    {format(new Date(ticket.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate pr-4 text-sm">{ticket.subject}</h3>
                <div className="flex items-center justify-between">
                   <p className="text-xs text-slate-500 truncate mt-1 flex-1">{ticket.description}</p>
                   {ticket._count?.messages > 0 && (
                     <Badge className="ml-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none rounded-full h-5 px-1.5 flex items-center justify-center text-[10px] min-w-[20px]">
                        {ticket._count.messages}
                     </Badge>
                   )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Side: Chat View */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950/50">
        {activeTicketId && ticketDetails ? (
          <>
            {/* Chat Header */}
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{ticketDetails.subject}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock size={12} /> {format(new Date(ticketDetails.createdAt), "MMMM d, yyyy")}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <Badge className={cn("text-[9px] uppercase tracking-wider font-black px-2 py-0 h-5", priorityColors[ticketDetails.priority])}>
                    {ticketDetails.priority} Priority
                  </Badge>
                </div>
              </div>
              <Badge className={cn("text-[10px] uppercase tracking-wider font-bold border px-3 py-1", statusColors[ticketDetails.status])}>
                {ticketDetails.status.replace("_", " ")}
              </Badge>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Original description as first message */}
              <div className="flex flex-col items-start w-full max-w-[85%]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-4">You • Original Request</span>
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-200 shadow-sm">
                  {ticketDetails.description}
                </div>
              </div>

              {ticketDetails.messages?.map((msg: { id: string; senderRole: string; senderName?: string; createdAt: string; content: string }) => {
                const isAgent = msg.senderRole === "SUPPORT_AGENT";
                
                return (
                  <div key={msg.id} className={cn("flex flex-col w-full max-w-[85%]", isAgent ? "items-end ml-auto" : "items-start")}>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider mb-1", 
                      isAgent ? "text-indigo-500 dark:text-indigo-400 mr-4" : "text-slate-400 ml-4"
                    )}>
                      {isAgent ? `Support Agent (${msg.senderName})` : "You"} • {format(new Date(msg.createdAt), "h:mm a")}
                    </span>
                    <div className={cn(
                      "px-5 py-4 text-sm shadow-sm",
                      isAgent 
                        ? "rounded-2xl rounded-tr-sm bg-indigo-600 text-white shadow-indigo-600/20" 
                        : "rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              {ticketDetails.status === "CLOSED" ? (
                <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">This ticket has been closed.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full pl-5 pr-14 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm text-sm"
                  />
                  <Button 
                    type="submit" 
                    disabled={sendMessage.isPending || !newMessage.trim()}
                    size="icon" 
                    className="absolute right-2 h-10 w-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
                  >
                    <Send size={16} className={cn(sendMessage.isPending && "opacity-0")} />
                  </Button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 h-full">
            <div className="w-24 h-24 mb-6 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">How can we help?</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              Select a ticket from the left to view messages, or create a new support request to get help from our team.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
