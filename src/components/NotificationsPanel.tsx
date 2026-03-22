import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Notification {
  id: number;
  type: "message" | "security" | "system" | "mention";
  title: string;
  text: string;
  time: string;
  read: boolean;
  avatar?: string;
  avatarGradient?: string;
}

const INITIAL: Notification[] = [
  {
    id: 1, type: "message", title: "Алина Морозова",
    text: "Окей, договорились! Жду завтра в 15:00",
    time: "14:32", read: false,
    avatar: "А", avatarGradient: "from-violet-500 to-purple-700",
  },
  {
    id: 2, type: "mention", title: "Команда Volna",
    text: "@вы были упомянуты: «Новое обновление вышло 🎉»",
    time: "11:45", read: false,
    avatar: "V", avatarGradient: "from-blue-500 to-cyan-500",
  },
  {
    id: 3, type: "security", title: "Новый вход в аккаунт",
    text: "Вход с устройства Windows · 77.88.55.1",
    time: "09:10", read: false,
  },
  {
    id: 4, type: "message", title: "Дмитрий Козлов",
    text: "Отправил файл на почту, проверь пожалуйста",
    time: "Вчера", read: true,
    avatar: "Д", avatarGradient: "from-pink-500 to-rose-600",
  },
  {
    id: 5, type: "system", title: "Volna обновился до v2.1",
    text: "Добавлено сквозное шифрование групповых чатов",
    time: "Вчера", read: true,
  },
  {
    id: 6, type: "security", title: "Смена пароля",
    text: "Пароль успешно изменён с нового устройства",
    time: "Пн", read: true,
  },
  {
    id: 7, type: "message", title: "Мария Иванова",
    text: "Спасибо за помощь! Очень выручил",
    time: "Пн", read: true,
    avatar: "М", avatarGradient: "from-emerald-500 to-teal-600",
  },
];

const TYPE_META = {
  message:  { icon: "MessageCircle", color: "text-violet-400",  bg: "from-violet-500 to-purple-600",  label: "Сообщение" },
  mention:  { icon: "AtSign",        color: "text-blue-400",    bg: "from-blue-500 to-cyan-500",       label: "Упоминание" },
  security: { icon: "ShieldAlert",   color: "text-amber-400",   bg: "from-amber-500 to-orange-500",    label: "Безопасность" },
  system:   { icon: "Zap",           color: "text-emerald-400", bg: "from-emerald-500 to-teal-600",    label: "Система" },
};

const FILTERS = ["Все", "Сообщения", "Безопасность", "Система"] as const;
type Filter = typeof FILTERS[number];

export default function NotificationsPanel() {
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const [filter, setFilter] = useState<Filter>("Все");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) => setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const remove = (id: number) => setItems((prev) => prev.filter((n) => n.id !== id));

  const filtered = items.filter((n) => {
    if (filter === "Все") return true;
    if (filter === "Сообщения") return n.type === "message" || n.type === "mention";
    if (filter === "Безопасность") return n.type === "security";
    if (filter === "Система") return n.type === "system";
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 glass-strong">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center relative">
          <Icon name="Bell" size={17} className="text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 gradient-bg rounded-full text-white text-xs flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-white text-sm">Уведомления</h2>
          <span className="text-xs text-white/35">
            {unreadCount > 0 ? `${unreadCount} непрочитанных` : "Всё прочитано"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Выключить звук" : "Включить звук"}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${soundEnabled ? "text-violet-400 bg-violet-500/15" : "text-white/25 hover:bg-white/5"}`}
          >
            <Icon name={soundEnabled ? "Volume2" : "VolumeX"} size={14} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Icon name="CheckCheck" size={12} />
              Прочитать все
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 px-5 pt-3 pb-0 overflow-x-auto">
        {FILTERS.map((f) => {
          const count = f === "Все" ? unreadCount
            : f === "Сообщения" ? items.filter((n) => !n.read && (n.type === "message" || n.type === "mention")).length
            : f === "Безопасность" ? items.filter((n) => !n.read && n.type === "security").length
            : items.filter((n) => !n.read && n.type === "system").length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150
                ${filter === f ? "active-nav text-violet-300" : "text-white/35 hover:text-white/60 hover:bg-white/5"}`}
            >
              {f}
              {count > 0 && (
                <span className="w-4 h-4 gradient-bg rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
              <Icon name="BellOff" size={24} className="text-white/20" />
            </div>
            <p className="text-white/30 text-sm">Уведомлений нет</p>
          </div>
        ) : (
          filtered.map((n) => {
            const meta = TYPE_META[n.type];
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`group glass rounded-xl px-4 py-3 flex items-start gap-3 cursor-pointer transition-all duration-150 hover:bg-white/6
                  ${!n.read ? "border border-violet-500/15 bg-violet-500/5" : "border border-transparent"}`}
              >
                {/* Avatar / icon */}
                <div className="flex-shrink-0 mt-0.5 relative">
                  {n.avatar ? (
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${n.avatarGradient} flex items-center justify-center text-white font-bold text-sm`}>
                      {n.avatar}
                    </div>
                  ) : (
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.bg} flex items-center justify-center`}>
                      <Icon name={meta.icon} fallback="Bell" size={15} className="text-white" />
                    </div>
                  )}
                  {!n.read && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 gradient-bg rounded-full border border-background" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${meta.color} bg-white/5`}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-white/25 ml-auto">{n.time}</span>
                  </div>
                  <p className={`text-sm font-medium mb-0.5 ${n.read ? "text-white/60" : "text-white/90"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-white/35 leading-relaxed line-clamp-2">{n.text}</p>
                </div>

                {/* Remove */}
                <button
                  onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-white/20 hover:text-white/60 transition-all mt-0.5"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Settings bar */}
      <div className="px-5 py-3 border-t border-white/5 glass-strong">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Bell" size={13} className="text-white/30" />
            <span className="text-xs text-white/35">Push-уведомления</span>
          </div>
          <button
            onClick={() => setPushEnabled(!pushEnabled)}
            className={`w-10 rounded-full flex items-center relative transition-all duration-300 ${pushEnabled ? "bg-violet-500" : "bg-white/10"}`}
            style={{ minWidth: "2.5rem", height: "1.375rem" }}
          >
            <span
              className="absolute w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
              style={{ left: pushEnabled ? "calc(100% - 1.125rem)" : "2px" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
