import { useState } from "react";
import Icon from "@/components/ui/icon";

interface SettingsPanelProps {
  isPremium?: boolean;
}

type Section = "general" | "privacy" | "chats" | "notifications" | "storage";

const SECTIONS = [
  { id: "general",       icon: "Sliders",      label: "Общие" },
  { id: "privacy",       icon: "EyeOff",       label: "Приватность" },
  { id: "chats",         icon: "MessageCircle",label: "Чаты" },
  { id: "notifications", icon: "Bell",          label: "Уведомления" },
  { id: "storage",       icon: "HardDrive",    label: "Хранилище" },
] as const;

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-10 rounded-full flex items-center relative transition-all duration-300 flex-shrink-0 ${value ? "bg-violet-500" : "bg-white/10"}`}
      style={{ minWidth: "2.5rem", height: "1.375rem" }}
    >
      <span
        className="absolute w-4 h-4 bg-white rounded-full shadow transition-all duration-300"
        style={{ left: value ? "calc(100% - 1.125rem)" : "2px" }}
      />
    </button>
  );
}

function SettingRow({ icon, iconBg, title, desc, children, border = true }: {
  icon: string; iconBg: string; title: string; desc?: string; children: React.ReactNode; border?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 py-3 ${border ? "border-b border-white/5" : ""}`}>
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon name={icon} fallback="Circle" size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/85">{title}</p>
        {desc && <p className="text-xs text-white/30 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPanel({ isPremium }: SettingsPanelProps) {
  const [section, setSection] = useState<Section>("general");

  const [settings, setSettings] = useState({
    // general
    language: "ru",
    darkMode: true,
    compactMode: false,
    animations: true,
    fontSize: "md",
    // privacy
    lastSeen: "all",
    readReceipts: true,
    typingIndicator: true,
    profilePhoto: "all",
    onlineStatus: true,
    // chats
    enterToSend: true,
    autoDownload: true,
    linkPreview: true,
    spellcheck: true,
    messageSound: true,
    // notifications
    pushNotifications: true,
    messageNotif: true,
    mentionNotif: true,
    securityNotif: true,
    quietHours: false,
    quietFrom: "23:00",
    quietTo: "08:00",
    // storage
    autoDeleteDays: "never",
    cacheSize: "2.4",
  });

  const set = (key: string, val: unknown) => setSettings((s) => ({ ...s, [key]: val }));

  return (
    <div className="flex-1 flex flex-col min-w-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 glass-strong">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
          <Icon name="Settings" size={17} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-sm">Настройки</h2>
          <span className="text-xs text-white/35">Управление приложением</span>
        </div>
        {isPremium && (
          <span className="ml-auto flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/25 text-amber-300 px-2.5 py-1 rounded-full">
            <Icon name="Crown" size={11} />
            Premium
          </span>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar sections */}
        <div className="w-40 flex flex-col gap-0.5 p-3 border-r border-white/5 flex-shrink-0">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id as Section)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all duration-150
                ${section === s.id ? "active-nav text-violet-300" : "text-white/35 hover:text-white/65 hover:bg-white/5"}`}
            >
              <Icon name={s.icon} fallback="Circle" size={13} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* ── GENERAL ── */}
          {section === "general" && (
            <>
              <div className="glass rounded-xl px-4 py-1">
                <SettingRow icon="Globe" iconBg="from-blue-500 to-cyan-500" title="Язык интерфейса">
                  <select
                    value={settings.language}
                    onChange={(e) => set("language", e.target.value)}
                    className="bg-white/8 border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                  </select>
                </SettingRow>
                <SettingRow icon="Moon" iconBg="from-indigo-500 to-violet-600" title="Тёмная тема" desc="Тёмный фон интерфейса">
                  <Toggle value={settings.darkMode} onChange={() => set("darkMode", !settings.darkMode)} />
                </SettingRow>
                <SettingRow icon="Layout" iconBg="from-slate-500 to-slate-700" title="Компактный режим" desc="Меньше отступов и аватаров">
                  <Toggle value={settings.compactMode} onChange={() => set("compactMode", !settings.compactMode)} />
                </SettingRow>
                <SettingRow icon="Sparkles" iconBg="from-pink-500 to-rose-600" title="Анимации" desc="Плавные переходы и эффекты">
                  <Toggle value={settings.animations} onChange={() => set("animations", !settings.animations)} />
                </SettingRow>
                <SettingRow icon="Type" iconBg="from-violet-500 to-purple-700" title="Размер текста" border={false}>
                  <div className="flex gap-1">
                    {[["sm", "S"], ["md", "M"], ["lg", "L"]].map(([val, lbl]) => (
                      <button key={val} onClick={() => set("fontSize", val)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${settings.fontSize === val ? "gradient-bg text-white" : "bg-white/8 text-white/40 hover:text-white/70"}`}
                      >{lbl}</button>
                    ))}
                  </div>
                </SettingRow>
              </div>

              <div className="glass rounded-xl px-4 py-3">
                <p className="text-xs text-white/25 font-medium uppercase tracking-wide mb-2">О приложении</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold gradient-text">Volna</p>
                    <p className="text-xs text-white/30">Версия 2.1.0 · Защищённый мессенджер</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center neon-glow-purple">
                    <span className="text-white font-black text-lg">V</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── PRIVACY ── */}
          {section === "privacy" && (
            <>
              <div className="glass rounded-xl px-4 py-1">
                <SettingRow icon="Clock" iconBg="from-violet-500 to-purple-700" title="Время последнего визита">
                  <select value={settings.lastSeen} onChange={(e) => set("lastSeen", e.target.value)}
                    className="bg-white/8 border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="all">Все</option>
                    <option value="contacts">Контакты</option>
                    <option value="nobody">Никто</option>
                  </select>
                </SettingRow>
                <SettingRow icon="CheckCheck" iconBg="from-emerald-500 to-teal-600" title="Галочки прочтения" desc="Показывать, что сообщение прочитано">
                  <Toggle value={settings.readReceipts} onChange={() => set("readReceipts", !settings.readReceipts)} />
                </SettingRow>
                <SettingRow icon="PenLine" iconBg="from-blue-500 to-cyan-500" title="Индикатор печати" desc="Показывать «печатает...»">
                  <Toggle value={settings.typingIndicator} onChange={() => set("typingIndicator", !settings.typingIndicator)} />
                </SettingRow>
                <SettingRow icon="Image" iconBg="from-pink-500 to-rose-600" title="Фото профиля">
                  <select value={settings.profilePhoto} onChange={(e) => set("profilePhoto", e.target.value)}
                    className="bg-white/8 border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="all">Все</option>
                    <option value="contacts">Контакты</option>
                    <option value="nobody">Никто</option>
                  </select>
                </SettingRow>
                <SettingRow icon="Wifi" iconBg="from-amber-500 to-orange-500" title="Статус «онлайн»" desc="Видно ли другим, что вы в сети" border={false}>
                  <Toggle value={settings.onlineStatus} onChange={() => set("onlineStatus", !settings.onlineStatus)} />
                </SettingRow>
              </div>

              {!isPremium && (
                <div className="glass rounded-xl p-4 border border-amber-500/15">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Crown" size={14} className="text-amber-400" />
                    <p className="text-sm font-semibold text-amber-300">Premium приватность</p>
                  </div>
                  <p className="text-xs text-white/35 mb-3">Скрытый режим, анонимный просмотр историй, антискриншот</p>
                  <button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold py-2 rounded-xl hover:scale-[1.02] transition-transform">
                    Разблокировать за 299 ₽/мес
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── CHATS ── */}
          {section === "chats" && (
            <div className="glass rounded-xl px-4 py-1">
              <SettingRow icon="CornerDownLeft" iconBg="from-violet-500 to-purple-700" title="Enter для отправки" desc="Shift+Enter — новая строка">
                <Toggle value={settings.enterToSend} onChange={() => set("enterToSend", !settings.enterToSend)} />
              </SettingRow>
              <SettingRow icon="Download" iconBg="from-blue-500 to-cyan-500" title="Авто-загрузка медиа" desc="Скачивать фото и видео автоматически">
                <Toggle value={settings.autoDownload} onChange={() => set("autoDownload", !settings.autoDownload)} />
              </SettingRow>
              <SettingRow icon="Link" iconBg="from-emerald-500 to-teal-600" title="Превью ссылок" desc="Показывать превью для URL">
                <Toggle value={settings.linkPreview} onChange={() => set("linkPreview", !settings.linkPreview)} />
              </SettingRow>
              <SettingRow icon="SpellCheck" iconBg="from-pink-500 to-rose-600" title="Проверка орфографии">
                <Toggle value={settings.spellcheck} onChange={() => set("spellcheck", !settings.spellcheck)} />
              </SettingRow>
              <SettingRow icon="Volume2" iconBg="from-amber-500 to-orange-500" title="Звук сообщений" border={false}>
                <Toggle value={settings.messageSound} onChange={() => set("messageSound", !settings.messageSound)} />
              </SettingRow>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {section === "notifications" && (
            <>
              <div className="glass rounded-xl px-4 py-1">
                <SettingRow icon="Bell" iconBg="from-violet-500 to-purple-700" title="Push-уведомления" desc="Уведомления вне приложения">
                  <Toggle value={settings.pushNotifications} onChange={() => set("pushNotifications", !settings.pushNotifications)} />
                </SettingRow>
                <SettingRow icon="MessageCircle" iconBg="from-blue-500 to-cyan-500" title="Сообщения">
                  <Toggle value={settings.messageNotif} onChange={() => set("messageNotif", !settings.messageNotif)} />
                </SettingRow>
                <SettingRow icon="AtSign" iconBg="from-pink-500 to-rose-600" title="Упоминания" desc="Когда вас упоминают в чате">
                  <Toggle value={settings.mentionNotif} onChange={() => set("mentionNotif", !settings.mentionNotif)} />
                </SettingRow>
                <SettingRow icon="ShieldAlert" iconBg="from-amber-500 to-orange-500" title="Безопасность" desc="Входы и подозрительная активность" border={false}>
                  <Toggle value={settings.securityNotif} onChange={() => set("securityNotif", !settings.securityNotif)} />
                </SettingRow>
              </div>

              <div className="glass rounded-xl px-4 py-1">
                <SettingRow icon="MoonStar" iconBg="from-indigo-500 to-violet-700" title="Тихие часы" desc="Не беспокоить в указанное время">
                  <Toggle value={settings.quietHours} onChange={() => set("quietHours", !settings.quietHours)} />
                </SettingRow>
                {settings.quietHours && (
                  <div className="flex items-center gap-3 pb-3">
                    <span className="text-xs text-white/40">С</span>
                    <input type="time" value={settings.quietFrom} onChange={(e) => set("quietFrom", e.target.value)}
                      className="bg-white/8 border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1 outline-none"
                    />
                    <span className="text-xs text-white/40">до</span>
                    <input type="time" value={settings.quietTo} onChange={(e) => set("quietTo", e.target.value)}
                      className="bg-white/8 border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1 outline-none"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── STORAGE ── */}
          {section === "storage" && (
            <>
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-white/30 font-medium uppercase tracking-wide mb-3">Использование</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Кэш", value: "2.4 МБ", icon: "Database", color: "from-violet-500 to-purple-700" },
                    { label: "Медиа", value: "18 МБ", icon: "Image", color: "from-blue-500 to-cyan-500" },
                    { label: "Всего", value: "20.4 МБ", icon: "HardDrive", color: "from-emerald-500 to-teal-600" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/5 rounded-xl p-3 text-center">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon name={item.icon} fallback="Circle" size={14} className="text-white" />
                      </div>
                      <p className="text-sm font-bold text-white">{item.value}</p>
                      <p className="text-xs text-white/30">{item.label}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full bg-white/6 hover:bg-white/10 border border-white/8 text-white/60 hover:text-white/90 text-sm py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Icon name="Trash2" size={14} />
                  Очистить кэш
                </button>
              </div>

              <div className="glass rounded-xl px-4 py-1">
                <SettingRow icon="Timer" iconBg="from-rose-500 to-red-600" title="Авто-удаление сообщений" desc="Удалять переписку автоматически" border={false}>
                  <select value={settings.autoDeleteDays} onChange={(e) => set("autoDeleteDays", e.target.value)}
                    className="bg-white/8 border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="never">Никогда</option>
                    <option value="7">7 дней</option>
                    <option value="30">30 дней</option>
                    <option value="90">90 дней</option>
                  </select>
                </SettingRow>
              </div>

              <div className="glass rounded-xl px-4 py-3 border border-red-500/10">
                <p className="text-xs font-semibold text-red-400/60 uppercase tracking-wide mb-2">Сброс</p>
                <button className="w-full text-sm text-red-400/70 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 py-2 rounded-xl transition-colors">
                  Сбросить все настройки
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
