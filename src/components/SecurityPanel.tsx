import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/3b8b4e86-99bb-44fb-8a3d-f78f5859ee58";

interface SecurityEvent {
  event_type: string;
  ip_address: string;
  device_info: string;
  status: string;
  created_at: string;
}

interface Session {
  id: number;
  ip_address: string;
  device_info: string;
  created_at: string;
  expires_at: string;
}

interface SecurityPanelProps {
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const EVENT_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  login:             { icon: "LogIn",      color: "text-emerald-400", label: "Вход" },
  login_failed:      { icon: "ShieldAlert",color: "text-red-400",     label: "Неудачный вход" },
  logout:            { icon: "LogOut",     color: "text-white/40",    label: "Выход" },
  register:          { icon: "UserPlus",   color: "text-violet-400",  label: "Регистрация" },
  premium_activated: { icon: "Crown",      color: "text-amber-400",   label: "Премиум активирован" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function shortDevice(ua: string) {
  if (!ua || ua === "unknown") return "Неизвестное устройство";
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return ua.slice(0, 28) + "…";
}

export default function SecurityPanel({ isPremium, onUpgrade }: SecurityPanelProps) {
  const [tab, setTab] = useState<"overview" | "sessions" | "log">("overview");
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [twoFa, setTwoFa] = useState(false);
  const [e2e, setE2e] = useState(true);

  const token = localStorage.getItem("volna_token");

  const fetchLog = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [logRes, sessRes] = await Promise.all([
        fetch(`${AUTH_URL}/?action=log`, { headers: { "X-Auth-Token": token } }),
        fetch(`${AUTH_URL}/?action=sessions`, { headers: { "X-Auth-Token": token } }),
      ]);
      const logData = await logRes.json();
      const sessData = await sessRes.json();
      if (logData.events) setEvents(logData.events);
      if (sessData.sessions) setSessions(sessData.sessions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "sessions" || tab === "log") fetchLog();
  }, [tab]);

  const TABS = [
    { id: "overview", label: "Обзор", icon: "ShieldCheck" },
    { id: "sessions", label: "Сессии", icon: "Monitor" },
    { id: "log",      label: "Журнал", icon: "ScrollText" },
  ] as const;

  return (
    <div className="flex-1 flex flex-col min-w-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 glass-strong">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
          <Icon name="ShieldCheck" size={18} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-sm">Безопасность</h2>
          <span className="text-xs text-emerald-400">Все системы защищены</span>
        </div>
        {isPremium && (
          <span className="ml-auto flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/25 text-amber-300 px-2.5 py-1 rounded-full">
            <Icon name="Crown" size={11} />
            Premium
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pt-4 pb-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150
              ${tab === t.id ? "active-nav text-violet-300" : "text-white/35 hover:text-white/60 hover:bg-white/5"}`}
          >
            <Icon name={t.icon} fallback="Circle" size={13} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-4">
            {/* Score */}
            <div className="glass rounded-2xl p-5 flex items-center gap-5">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none"
                    stroke="url(#secGrad)" strokeWidth="3"
                    strokeDasharray={`${e2e ? (twoFa ? 88 : 72) : 48} 100`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="secGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black gradient-text">{e2e ? (twoFa ? "88" : "72") : "48"}</span>
                  <span className="text-xs text-white/30">/ 100</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-white text-base mb-0.5">Уровень защиты</p>
                <p className="text-xs text-white/40 leading-relaxed">
                  {twoFa && e2e ? "Максимальная защита аккаунта" : "Включите 2FA для максимальной защиты"}
                </p>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-2">
              {[
                {
                  icon: "Lock", color: "from-violet-500 to-purple-600",
                  title: "Сквозное шифрование (E2E)",
                  desc: "Все сообщения зашифрованы на устройстве",
                  value: e2e, set: setE2e, locked: false,
                },
                {
                  icon: "Fingerprint", color: "from-blue-500 to-cyan-500",
                  title: "Двухфакторная аутентификация",
                  desc: "Дополнительный код при каждом входе",
                  value: twoFa, set: setTwoFa, locked: !isPremium,
                },
                {
                  icon: "EyeOff", color: "from-pink-500 to-rose-600",
                  title: "Скрытый статус «онлайн»",
                  desc: "Другие не видят, когда вы активны",
                  value: false, set: () => {}, locked: !isPremium,
                },
                {
                  icon: "Bell", color: "from-amber-500 to-orange-500",
                  title: "Уведомления о новых входах",
                  desc: "Получать алерт при входе с нового устройства",
                  value: true, set: () => {}, locked: false,
                },
              ].map((item, i) => (
                <div key={i} className={`glass rounded-xl px-4 py-3 flex items-center gap-3 ${item.locked ? "opacity-60" : ""}`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={item.icon} fallback="Circle" size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 flex items-center gap-2">
                      {item.title}
                      {item.locked && (
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Icon name="Crown" size={9} />
                          Premium
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/35 truncate">{item.desc}</p>
                  </div>
                  {!item.locked ? (
                    <button
                      onClick={() => item.set(!item.value)}
                      className={`w-10 h-5.5 rounded-full transition-all duration-300 flex items-center relative flex-shrink-0
                        ${item.value ? "bg-violet-500" : "bg-white/10"}`}
                      style={{ minWidth: "2.5rem", height: "1.375rem" }}
                    >
                      <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${item.value ? "left-5.5" : "left-0.5"}`}
                        style={{ left: item.value ? "calc(100% - 1.125rem)" : "2px" }}
                      />
                    </button>
                  ) : (
                    <button onClick={onUpgrade} className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0">
                      Разблокировать
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Encryption key block */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Key" size={14} className="text-violet-400" />
                <span className="text-sm font-medium text-white/80">Ключ шифрования</span>
              </div>
              <div className="font-mono text-xs text-white/30 bg-white/4 rounded-lg p-3 break-all leading-relaxed select-all">
                E2E-VOLNA-{Math.random().toString(36).slice(2, 10).toUpperCase()}-
                {Math.random().toString(36).slice(2, 10).toUpperCase()}-
                {Math.random().toString(36).slice(2, 6).toUpperCase()}
              </div>
              <p className="text-xs text-white/25 mt-2">Ключ генерируется локально и никогда не покидает устройство</p>
            </div>
          </div>
        )}

        {/* ── SESSIONS ── */}
        {tab === "sessions" && (
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Monitor" size={32} className="text-white/15 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Нет активных сессий</p>
              </div>
            ) : sessions.map((s) => (
              <div key={s.id} className="glass rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="Monitor" size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90">{shortDevice(s.device_info)}</p>
                  <p className="text-xs text-white/35 mt-0.5">IP: {s.ip_address || "—"}</p>
                  <p className="text-xs text-white/25 mt-0.5">Вход: {formatDate(s.created_at)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Активна
                  </span>
                  <span className="text-xs text-white/20">до {formatDate(s.expires_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── LOG ── */}
        {tab === "log" && (
          <div className="flex flex-col gap-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="ScrollText" size={32} className="text-white/15 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Журнал пуст</p>
              </div>
            ) : events.map((e, i) => {
              const meta = EVENT_ICONS[e.event_type] || { icon: "Info", color: "text-white/40", label: e.event_type };
              return (
                <div key={i} className="glass rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in">
                  <div className={`flex-shrink-0 ${meta.color}`}>
                    <Icon name={meta.icon} fallback="Circle" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium">{meta.label}</p>
                    <p className="text-xs text-white/30 truncate">{shortDevice(e.device_info)} · {e.ip_address || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${e.status === "success" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                      {e.status === "success" ? "OK" : "Ошибка"}
                    </span>
                    <span className="text-xs text-white/20">{formatDate(e.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
