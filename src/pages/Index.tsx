import { useState } from "react";
import Icon from "@/components/ui/icon";
import SecurityPanel from "@/components/SecurityPanel";
import ProfilePanel from "@/components/ProfilePanel";
import NotificationsPanel from "@/components/NotificationsPanel";
import SettingsPanel from "@/components/SettingsPanel";
import PremiumPanel from "@/components/PremiumPanel";

const CONTACTS = [
  { id: 1, name: "Алина Морозова", avatar: "А", status: "online", lastMsg: "Окей, договорились!", time: "14:32", unread: 2, encrypted: true },
  { id: 2, name: "Дмитрий Козлов", avatar: "Д", status: "online", lastMsg: "Отправил файл на почту", time: "13:10", unread: 0, encrypted: true },
  { id: 3, name: "Команда Volna", avatar: "V", status: "online", lastMsg: "Новое обновление вышло 🎉", time: "11:45", unread: 5, encrypted: true },
  { id: 4, name: "Саша Петров", avatar: "С", status: "offline", lastMsg: "Буду завтра на встрече", time: "Вчера", unread: 0, encrypted: false },
  { id: 5, name: "Мария Иванова", avatar: "М", status: "away", lastMsg: "Спасибо за помощь!", time: "Вчера", unread: 0, encrypted: true },
  { id: 6, name: "Николай Белов", avatar: "Н", status: "offline", lastMsg: "Посмотрю завтра", time: "Пн", unread: 0, encrypted: false },
];

const MESSAGES: Record<number, { id: number; text: string; out: boolean; time: string; encrypted: boolean }[]> = {
  1: [
    { id: 1, text: "Привет! Как дела с проектом?", out: false, time: "14:20", encrypted: true },
    { id: 2, text: "Всё отлично, почти закончили первый этап 🚀", out: true, time: "14:22", encrypted: true },
    { id: 3, text: "Когда покажешь демо?", out: false, time: "14:28", encrypted: true },
    { id: 4, text: "Завтра в 15:00, устроит?", out: true, time: "14:30", encrypted: true },
    { id: 5, text: "Окей, договорились!", out: false, time: "14:32", encrypted: true },
  ],
  2: [
    { id: 1, text: "Дмитрий, можешь прислать отчёт?", out: true, time: "12:50", encrypted: true },
    { id: 2, text: "Конечно, минуту", out: false, time: "13:05", encrypted: true },
    { id: 3, text: "Отправил файл на почту", out: false, time: "13:10", encrypted: true },
  ],
  3: [
    { id: 1, text: "Всем привет! Сегодня выходит v2.0", out: false, time: "11:30", encrypted: true },
    { id: 2, text: "Что нового?", out: true, time: "11:35", encrypted: true },
    { id: 3, text: "Новое обновление вышло 🎉", out: false, time: "11:45", encrypted: true },
  ],
};

const NAV_ITEMS = [
  { id: "chats",         icon: "MessageCircle", label: "Чаты" },
  { id: "contacts",      icon: "Users",         label: "Контакты" },
  { id: "search",        icon: "Search",        label: "Поиск" },
  { id: "notifications", icon: "Bell",          label: "Уведомления" },
  { id: "security",      icon: "ShieldCheck",   label: "Безопасность" },
  { id: "premium",       icon: "Crown",         label: "Premium" },
  { id: "settings",      icon: "Settings",      label: "Настройки" },
  { id: "profile",       icon: "User",          label: "Профиль" },
];

const statusColor: Record<string, string> = {
  online: "bg-emerald-400",
  offline: "bg-gray-500",
  away: "bg-amber-400",
};

const avatarGradients = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-500",
  "from-indigo-500 to-blue-600",
];

interface IndexProps {
  user?: Record<string, unknown> | null;
  isPremium?: boolean;
  onLogout?: () => void;
}

export default function Index({ user, isPremium: initialPremium, onLogout }: IndexProps) {
  const [activeNav, setActiveNav] = useState("chats");
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState(MESSAGES);
  const [search, setSearch] = useState("");
  const [isPremium, setIsPremium] = useState(initialPremium);

  const activeContact = CONTACTS.find((c) => c.id === activeChat);
  const chatMessages = activeChat ? (messages[activeChat] || []) : [];

  const filteredContacts = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    if (!inputText.trim() || !activeChat) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => ({
      ...prev,
      [activeChat]: [
        ...(prev[activeChat] || []),
        { id: Date.now(), text: inputText.trim(), out: true, time, encrypted: true },
      ],
    }));
    setInputText("");
  };

  return (
    <div className="flex h-screen bg-mesh overflow-hidden font-golos">
      {/* Sidebar nav */}
      <div className="w-16 flex flex-col items-center py-4 gap-1 glass border-r border-white/5 z-10">
        <div className="mb-4 mt-1">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center neon-glow-purple">
            <span className="text-white font-black text-sm">V</span>
          </div>
        </div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            title={item.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative
              ${item.id === "premium"
                ? activeNav === "premium"
                  ? "bg-gradient-to-br from-amber-400/30 to-orange-500/20 text-amber-300 border border-amber-500/40"
                  : "text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10"
                : activeNav === item.id
                  ? "active-nav text-violet-400"
                  : "text-white/30 hover:text-white/70 hover:bg-white/5"
              }`}
          >
            <Icon name={item.icon} fallback="Circle" size={18} />
            {item.id === "notifications" && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full pulse-dot" />
            )}
            {item.id === "premium" && !isPremium && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            )}
          </button>
        ))}
        <div className="mt-auto flex flex-col items-center gap-2">
          {isPremium && (
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center" title="Premium">
              <Icon name="Crown" size={12} className="text-white" />
            </div>
          )}
          <button
            onClick={onLogout}
            title="Выйти"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform"
          >
            {user ? String(user.display_name || user.username || "Я")[0].toUpperCase() : "Я"}
          </button>
        </div>
      </div>

      {/* Chats list */}
      <div className="w-72 flex flex-col border-r border-white/5 glass">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white text-base">
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label || "Чаты"}
            </h2>
            <button className="w-7 h-7 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 flex items-center justify-center text-violet-400 transition-colors">
              <Icon name="Plus" size={14} />
            </button>
          </div>
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-sm text-white/80 placeholder-white/25 outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {(activeNav === "chats" ? filteredContacts : activeNav === "contacts" ? CONTACTS : filteredContacts).map((c, i) => (
            <button
              key={c.id}
              onClick={() => { setActiveChat(c.id); setActiveNav("chats"); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl transition-all duration-150 text-left
                ${activeChat === c.id ? "bg-violet-500/15 border border-violet-500/20" : "hover:bg-white/4 border border-transparent"}`}
              style={{ width: "calc(100% - 8px)" }}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-white font-bold text-sm`}>
                  {c.avatar}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${statusColor[c.status]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/90 truncate">{c.name}</span>
                  <span className="text-xs text-white/30 ml-1 flex-shrink-0">{c.time}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {c.encrypted && <Icon name="Lock" size={10} className="text-violet-400/60 flex-shrink-0" />}
                  <span className="text-xs text-white/35 truncate">{c.lastMsg}</span>
                </div>
              </div>
              {c.unread > 0 && (
                <span className="flex-shrink-0 w-5 h-5 rounded-full gradient-bg text-white text-xs flex items-center justify-center font-bold">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {activeNav === "security" ? (
        <SecurityPanel isPremium={isPremium} onUpgrade={() => setActiveNav("settings")} />
      ) : activeNav === "profile" ? (
        <ProfilePanel user={user} isPremium={isPremium} onLogout={onLogout} />
      ) : activeNav === "notifications" ? (
        <NotificationsPanel />
      ) : activeNav === "settings" ? (
        <SettingsPanel isPremium={isPremium} />
      ) : activeNav === "premium" ? (
        <PremiumPanel isPremium={isPremium} onActivated={() => { setIsPremium(true); setActiveNav("chats"); }} />
      ) : activeContact ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 glass-strong">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[CONTACTS.indexOf(activeContact) % avatarGradients.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
              {activeContact.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{activeContact.name}</span>
                {activeContact.encrypted && (
                  <span className="flex items-center gap-1 text-xs text-violet-400/80 bg-violet-500/10 px-2 py-0.5 rounded-full">
                    <Icon name="Lock" size={10} />
                    E2E
                  </span>
                )}
              </div>
              <span className={`text-xs ${activeContact.status === "online" ? "text-emerald-400" : "text-white/35"}`}>
                {activeContact.status === "online" ? "онлайн" : activeContact.status === "away" ? "отошёл" : "не в сети"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[{ icon: "Phone", label: "Звонок" }, { icon: "Video", label: "Видео" }, { icon: "MoreVertical", label: "Ещё" }].map((btn) => (
                <button key={btn.icon} title={btn.label} className="w-8 h-8 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/6 flex items-center justify-center transition-colors">
                  <Icon name={btn.icon} fallback="Circle" size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
            <div className="flex justify-center mb-2">
              <span className="text-xs text-white/20 bg-white/4 px-3 py-1 rounded-full">Сегодня</span>
            </div>
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-fade-in`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${msg.out ? "msg-bubble-out rounded-br-sm" : "msg-bubble-in rounded-bl-sm"}`}>
                  <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${msg.out ? "justify-end" : "justify-start"}`}>
                    {msg.encrypted && <Icon name="Lock" size={9} className="text-white/30" />}
                    <span className="text-xs text-white/30">{msg.time}</span>
                    {msg.out && <Icon name="CheckCheck" size={11} className="text-violet-300/60" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/5 glass-strong">
            <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-2xl px-3 py-2 focus-within:border-violet-500/40 transition-colors">
              <button className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0">
                <Icon name="Smile" size={18} />
              </button>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Сообщение..."
                className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/25 outline-none"
              />
              <button className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0">
                <Icon name="Paperclip" size={16} />
              </button>
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 neon-glow-purple"
              >
                <Icon name="Send" size={14} />
              </button>
            </div>
            <div className="flex items-center justify-center gap-1 mt-1.5">
              <Icon name="Lock" size={10} className="text-white/15" />
              <span className="text-xs text-white/15">Сквозное шифрование активно</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto mb-4 flex items-center justify-center neon-glow-purple animate-float">
              <span className="text-white font-black text-2xl">V</span>
            </div>
            <h2 className="text-xl font-bold gradient-text mb-2">Volna</h2>
            <p className="text-white/30 text-sm">Выберите чат для начала общения</p>
          </div>
        </div>
      )}
    </div>
  );
}