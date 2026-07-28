"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { usePlatformSchools, useImpersonateAdmin } from "@/lib/api/hooks/usePlatformSchools"
import { usePlatformTickets, usePlatformTicketDetails, usePlatformUpdateTicket, usePlatformReplyTicket } from "@/lib/api/hooks/usePlatformSupport"
import { useSupportSocket } from "@/lib/hooks/useSupportSocket"
import { Search, MessageCircle, ShieldCheck, Zap, Mail, Phone, Clock, Send, Globe, CheckCircle2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function SupportCenterPage() {
    const [search, setSearch] = useState("")
    const [activeTicketId, setActiveTicketId] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [ticketSearch, setTicketSearch] = useState("")
    const [dateFilter, setDateFilter] = useState("")

    const { data: schoolsResponse, isLoading: schoolsLoading } = usePlatformSchools(search)
    const { data: tickets, isLoading: ticketsLoading } = usePlatformTickets()
    
    const schools = schoolsResponse?.data || [];
    
    const { data: ticketDetails } = usePlatformTicketDetails(activeTicketId || undefined)
    const updateTicket = usePlatformUpdateTicket()
    const replyTicket = usePlatformReplyTicket()
    useSupportSocket(activeTicketId || undefined)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const prevMessagesLengthRef = useRef(0)

    useEffect(() => {
        if (ticketDetails?.messages) {
            // Auto scroll to bottom
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            
            const newLength = ticketDetails.messages.length;
            if (prevMessagesLengthRef.current > 0 && newLength > prevMessagesLengthRef.current) {
                const lastMsg = ticketDetails.messages[newLength - 1];
                // Play sound if the message is from the user or AI (not us)
                if (lastMsg && lastMsg.senderRole !== "SUPPORT_AGENT") {
                    try {
                        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const playNote = (freq: number, startTime: number, duration: number) => {
                            const oscillator = audioCtx.createOscillator();
                            const gainNode = audioCtx.createGain();
                            oscillator.type = "sine";
                            oscillator.frequency.value = freq;
                            gainNode.gain.setValueAtTime(0, startTime);
                            gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
                            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                            oscillator.connect(gainNode);
                            gainNode.connect(audioCtx.destination);
                            oscillator.start(startTime);
                            oscillator.stop(startTime + duration);
                        };
                        const now = audioCtx.currentTime;
                        playNote(784, now, 0.2); // G5
                        playNote(1046.5, now + 0.1, 0.4); // C6
                    } catch (e) {
                        console.error("Audio API not supported");
                    }
                }
            }
            prevMessagesLengthRef.current = newLength;
        }
    }, [ticketDetails?.messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !activeTicketId) return
        console.log("[SupportConsole] Sending message for ticket:", activeTicketId, "Content:", newMessage);
        replyTicket.mutate(
            { ticketId: activeTicketId, content: newMessage },
            { onSuccess: () => setNewMessage("") }
        )
    }

    const handleUpdateStatus = (status: string) => {
        if (!activeTicketId) return
        updateTicket.mutate({ ticketId: activeTicketId, status })
    }

    const statusColors: any = {
        OPEN: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        RESOLVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        CLOSED: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    }

    const priorityColors: any = {
        LOW: "bg-slate-100 text-slate-600",
        MEDIUM: "bg-blue-100 text-blue-600",
        HIGH: "bg-orange-100 text-orange-600",
        URGENT: "bg-red-100 text-red-600 text-red-500 animate-pulse",
    }

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Support Command</h1>
                    <p className="text-slate-500 font-medium mt-1">Resolve inquiries and manage platform uptime.</p>
                </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="p-6 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-4 group transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none mb-1">Total Tickets</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{tickets?.length || 0}</p>
                    </div>
                 </div>
                 <div className="p-6 rounded-[2rem] bg-emerald-600/10 border border-emerald-500/20 flex items-center gap-4 group transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">Open Issues</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{tickets?.filter((t:any) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length || 0}</p>
                    </div>
                 </div>
                 <div className="p-6 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-4 group transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none mb-1">Active Schools</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{schools?.filter((s:any) => s.subscriptionStatus === 'ACTIVE').length || 0}</p>
                    </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                {/* Tickets Browser */}
                <Card className="lg:col-span-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-0 shadow-xl dark:shadow-2xl flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-lg font-black text-slate-900 dark:text-white mb-4">Tickets Inbox</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative group flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                                <input
                                    type="search"
                                    value={ticketSearch}
                                    onChange={(e) => setTicketSearch(e.target.value)}
                                    placeholder="Search subject..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>
                            <input 
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-[140px] px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-sm outline-none focus:border-indigo-500 transition-all font-medium text-slate-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {ticketsLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full bg-slate-50 dark:bg-slate-950 rounded-2xl" />
                            ))
                        ) : tickets?.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">Box is empty</div>
                        ) : (
                            tickets?.filter((t: any) => {
                                const searchLower = ticketSearch.toLowerCase();
                                const matchesSearch = 
                                    t.subject?.toLowerCase().includes(searchLower) || 
                                    t.userName?.toLowerCase().includes(searchLower) ||
                                    t.userEmail?.toLowerCase().includes(searchLower);
                                const matchesDate = dateFilter ? t.createdAt.startsWith(dateFilter) : true;
                                return matchesSearch && matchesDate;
                            }).map((ticket: any) => (
                                <button
                                    key={ticket.id}
                                    onClick={() => setActiveTicketId(ticket.id)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-2xl transition-all border",
                                        activeTicketId === ticket.id 
                                            ? "bg-white dark:bg-slate-800 border-indigo-500/30 shadow-md ring-2 ring-indigo-500/20" 
                                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-slate-700"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className={cn("text-[9px] uppercase tracking-wider font-bold border", priorityColors[ticket.priority])}>
                                            {ticket.priority}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {format(new Date(ticket.createdAt), "MMM d")}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{ticket.subject}</h4>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-[10px] font-medium text-slate-500 truncate mr-2 flex items-center gap-1">
                                            <Badge className={cn("text-[8px] px-1 py-0 h-4 uppercase", statusColors[ticket.status])}>{ticket.status.replace("_", " ")}</Badge>
                                            {ticket._count?.messages} msgs
                                        </p>
                                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{ticket.userType}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                {/* Ticket Chat & Details Area */}
                <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl dark:shadow-2xl flex flex-col overflow-hidden">
                    {activeTicketId && ticketDetails ? (
                        <>
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                                <div className="max-w-[60%]">
                                    <h3 className="text-md font-black text-slate-900 dark:text-white truncate">{ticketDetails.subject}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">From: {ticketDetails.userName} ({ticketDetails.userEmail})</span>
                                        {ticketDetails.schoolName && <Badge variant="outline" className="text-[9px] h-4 py-0">{ticketDetails.schoolName}</Badge>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {updateTicket.isPending && <Loader2 className="animate-spin text-indigo-500" size={16} />}
                                    <select 
                                        value={ticketDetails.status}
                                        onChange={(e) => handleUpdateStatus(e.target.value)}
                                        disabled={updateTicket.isPending}
                                        className={cn(
                                            "text-xs font-bold px-3 py-1.5 rounded-lg border outline-none appearance-none cursor-pointer",
                                            statusColors[ticketDetails.status],
                                            updateTicket.isPending && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 dark:bg-[#0B1120]">
                                {/* Request context */}
                                <div className="flex flex-col items-start w-full max-w-[85%]">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider mb-1 ml-4 uppercase">
                                        {ticketDetails.userType.toLowerCase()} • Original Request
                                    </span>
                                    <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                    {ticketDetails.description}
                                    </div>
                                </div>

                                {ticketDetails.messages?.map((msg: any) => {
                                    const isAgent = msg.senderRole === "SUPPORT_AGENT"
                                    const isAI = msg.senderRole === "SYSTEM" || msg.senderRole === "AI_SYSTEM" || msg.senderRole === "AI"
                                    const isUser = !isAgent && !isAI;

                                    let bubbleAlign = "items-start"
                                    let nameStyle = "text-slate-400 ml-4"
                                    let bubbleStyle = "rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                                    
                                    if (isAgent) {
                                       bubbleAlign = "items-end ml-auto"
                                       nameStyle = "text-indigo-500 dark:text-indigo-400 mr-4"
                                       bubbleStyle = "rounded-2xl rounded-tr-sm bg-indigo-600 text-white border border-indigo-500 shadow-indigo-600/20"
                                    } else if (isUser) {
                                       bubbleAlign = "items-start"
                                       nameStyle = "text-blue-500 dark:text-blue-400 ml-4"
                                       bubbleStyle = "rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm"
                                    } else if (isAI) {
                                       bubbleAlign = "items-end ml-auto"
                                       nameStyle = "text-emerald-500 dark:text-emerald-400 mr-4"
                                       bubbleStyle = "rounded-2xl rounded-tr-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800/30 shadow-sm"
                                    }

                                    return (
                                    <div key={msg.id} className={cn("flex flex-col w-full max-w-[85%]", bubbleAlign)}>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider mb-1", 
                                            nameStyle
                                        )}>
                                            {isAgent ? `Agent (${msg.senderName})` : isAI ? `🤖 AI (${msg.senderName})` : `👤 User (${msg.senderName})`} • {format(new Date(msg.createdAt), "h:mm a")}
                                        </span>
                                        <div className={cn(
                                            "px-5 py-4 text-sm shadow-sm whitespace-pre-wrap",
                                            bubbleStyle
                                        )}>
                                        {msg.content}
                                        </div>
                                    </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                                <form onSubmit={handleSendMessage} className="relative flex items-center">
                                    <input 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your response to the user..."
                                        className="w-full pl-5 pr-14 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm text-sm"
                                    />
                                    <Button 
                                        type="submit" 
                                        disabled={replyTicket.isPending || !newMessage.trim()}
                                        size="icon" 
                                        className="absolute right-2 h-10 w-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                                    >
                                        {replyTicket.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 h-full">
                            <div className="w-20 h-20 mb-6 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <MessageCircle className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Select a Ticket</h3>
                            <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">
                                Choose an open ticket from the inbox to review and dispatch a response to the tenant.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
