"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Send, MessageSquare, User, Shield, UserCheck, 
  Briefcase, CheckCheck, Paperclip, Smile, MoreVertical, Trash2, Phone, Video, Lock,
  ChevronLeft, X, ArrowDown
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { getUsers } from "@/features/users/services/userService"
import { getClients } from "@/features/clients/services/clientService"
import { getLeads } from "@/features/leads/services/leadService"
import { getProjects } from "@/features/projects/services/projectService"
import { ChatContact, ChatMessage } from "@/features/messages/types"
import { useMessagesQuery, useSaveMessagesMutation } from "@/features/messages/hooks/useMessages"
import { messageFeatureService } from "@/features/messages/services/messageService"

export function MessagesSection1({ ctrl }: { ctrl: any }) {
  const { mobileView, searchContact, setSearchContact, filteredContacts, currentUserRole, selectedContact, setSelectedContact, setMobileView, setIsSearchOpen, setSearchMessageQuery, isSearchOpen, searchMessageQuery, displayedThread, messagesContainerRef, currentUserEmail, canDelete, handleDeleteMessage, handleSendMessage, canSend, inputText, setInputText } = ctrl;
  return (
    <>
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-0 md:gap-4 mt-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs overflow-hidden">
        {/* ---------------- LEFT CONTACTS SIDEBAR ---------------- */}
        <div className={`col-span-12 md:col-span-4 lg:col-span-3 border-r border-zinc-200/80 dark:border-zinc-800 flex-col h-full bg-zinc-50/40 dark:bg-zinc-900 ${
          mobileView === "chat" ? "hidden md:flex" : "flex"
        }`}>
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search users, clients, admins..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 p-1.5 space-y-1 overscroll-contain">
            {filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400">
                {currentUserRole === "Teams"
                  ? "No assigned clients or team members found."
                  : "No contacts found."}
              </div>
            ) : (
              filteredContacts.map((c) => {
                const isSelected = selectedContact?.email === c.email
                let roleColor = "bg-zinc-100 text-zinc-600"
                if (c.role === "Super Admin" || c.role === "Admin") roleColor = "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                if (c.role === "Clients") roleColor = "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                if (c.role === "Teams") roleColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"

                return (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => {
                      setSelectedContact(c)
                      setMobileView("chat")
                      setIsSearchOpen(false)
                      setSearchMessageQuery("")
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">{c.name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${roleColor}`}>
                          {c.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] text-zinc-400 truncate">
                        {c.branchName && (
                          <span className="px-1.5 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[8.5px] shrink-0">
                            🏢 {c.branchName}
                          </span>
                        )}
                        <span className="truncate">{c.companyName || c.email}</span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ---------------- RIGHT CHAT CONVERSATION ---------------- */}
        <div className={`col-span-12 md:col-span-8 lg:col-span-9 flex-col h-full bg-white dark:bg-zinc-900 ${
          mobileView === "contacts" ? "hidden md:flex" : "flex"
        }`}>
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Back to Contacts Button */}
                  <button
                    type="button"
                    onClick={() => setMobileView("contacts")}
                    className="md:hidden p-1.5 -ml-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-0.5 cursor-pointer transition-colors"
                    title="Back to contacts list"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="relative shrink-0">
                    <img src={selectedContact.avatar} alt={selectedContact.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate flex-wrap">
                      <span className="truncate">{selectedContact.name}</span>
                      {(() => {
                        let headerRoleColor = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        if (selectedContact.role === "Super Admin" || selectedContact.role === "Admin") headerRoleColor = "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                        if (selectedContact.role === "Clients") headerRoleColor = "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        if (selectedContact.role === "Teams") headerRoleColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"

                        return (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${headerRoleColor}`}>
                            {selectedContact.role}
                          </span>
                        )
                      })()}
                      {selectedContact.branchName && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                          🏢 {selectedContact.branchName}
                        </span>
                      )}
                    </h2>
                    <p className="text-[10.5px] text-zinc-400 truncate mt-0.5">{selectedContact.companyName || selectedContact.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 text-zinc-400 shrink-0">
                  {/* In-Chat Search Button */}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(!isSearchOpen)
                      if (isSearchOpen) setSearchMessageQuery("")
                    }}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isSearchOpen
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                        : "hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                    title="Search messages in this conversation"
                  >
                    <Search size={16} />
                  </button>
                  <button className="p-2 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer">
                    <Phone size={16} />
                  </button>
                  <button className="p-2 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer">
                    <Video size={16} />
                  </button>
                </div>
              </div>

              {/* In-Chat Search Bar */}
              {isSearchOpen && (
                <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-blue-50/50 dark:bg-blue-950/30 flex items-center gap-2 shrink-0 animate-in fade-in duration-150">
                  <Search size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                  <input
                    type="text"
                    value={searchMessageQuery}
                    onChange={(e) => setSearchMessageQuery(e.target.value)}
                    placeholder="Search messages in this conversation..."
                    autoFocus
                    className="w-full text-xs bg-transparent border-none focus:outline-hidden text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  />
                  {searchMessageQuery.trim() && (
                    <span className="text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 shrink-0 whitespace-nowrap">
                      {displayedThread.length} {displayedThread.length === 1 ? "match" : "matches"}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false)
                      setSearchMessageQuery("")
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Chat Messages Area (Isolated smooth scrolling, no page jumps) */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-50/30 dark:bg-zinc-950/20 overscroll-contain"
              >
                {displayedThread.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 text-xs space-y-2">
                    <MessageSquare size={36} className="text-zinc-300 dark:text-zinc-700" />
                    {searchMessageQuery.trim() ? (
                      <>
                        <p className="font-semibold text-zinc-600 dark:text-zinc-400">No messages found matching &ldquo;{searchMessageQuery}&rdquo;</p>
                        <p className="text-[11px]">Try searching with a different word or clear the search.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-zinc-600 dark:text-zinc-400">Direct Chat with {selectedContact.name}</p>
                        <p className="text-[11px]">Send a message below to start your conversation.</p>
                      </>
                    )}
                  </div>
                ) : (
                  displayedThread.map((msg) => {
                    const isMe = msg.senderEmail.toLowerCase().trim() === currentUserEmail
                    const isHighlight = searchMessageQuery.trim().length > 0

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[65%] space-y-1 ${isMe ? "items-end text-right" : "items-start text-left"}`}>
                          <div className="flex items-center gap-1.5">
                            {isMe && canDelete && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-opacity cursor-pointer"
                                title="Delete Message"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                            <div
                              className={`p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-wrap ${
                                isMe
                                  ? "bg-blue-600 text-white rounded-tr-none"
                                  : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/80 rounded-tl-none"
                              } ${isHighlight ? "ring-2 ring-amber-400/80" : ""}`}
                            >
                              {msg.text}
                            </div>
                            {!isMe && canDelete && currentUserRole === "Super Admin" && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-opacity cursor-pointer"
                                title="Delete Message"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 px-1">
                            <span>{msg.timestamp}</span>
                            {isMe && (
                              <span title={msg.read ? "Read by recipient" : "Delivered"}>
                                <CheckCheck 
                                  size={13} 
                                  className={msg.read ? "text-sky-400 dark:text-sky-300 font-bold stroke-[2.5]" : "text-zinc-400/80 dark:text-zinc-500"} 
                                />
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-2.5 sm:p-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => alert("Attachment functionality ready")}
                  className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  type="text"
                  placeholder={canSend ? `Message ${selectedContact.name}...` : "Message sending is disabled for your account."}
                  value={inputText}
                  disabled={!canSend}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || !canSend}
                  className="p-2 sm:p-2.5 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <span className="hidden sm:inline">Send</span>
                  <Send size={13} />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-zinc-400 text-xs">
              Select a contact to begin chatting.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
