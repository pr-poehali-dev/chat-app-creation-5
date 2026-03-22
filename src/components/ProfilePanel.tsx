import { useState } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/3b8b4e86-99bb-44fb-8a3d-f78f5859ee58";

interface ProfilePanelProps {
  user?: Record<string, unknown> | null;
  isPremium?: boolean;
  onLogout?: () => void;
  onUserUpdate?: (u: Record<string, unknown>) => void;
}

const THEMES = [
  { id: "violet", label: "Фиолет", from: "from-violet-500", to: "to-purple-700" },
  { id: "blue",   label: "Синий",  from: "from-blue-500",   to: "to-cyan-500" },
  { id: "pink",   label: "Розовый",from: "from-pink-500",   to: "to-rose-600" },
  { id: "green",  label: "Зелёный",from: "from-emerald-500",to: "to-teal-600" },
  { id: "amber",  label: "Золотой",from: "from-amber-400",  to: "to-orange-500" },
];

const STATUSES = [
  { id: "online",  label: "В сети",      color: "bg-emerald-400" },
  { id: "away",    label: "Отошёл",      color: "bg-amber-400" },
  { id: "busy",    label: "Не беспокоить", color: "bg-red-400" },
  { id: "offline", label: "Невидимка",   color: "bg-gray-500" },
];

export default function ProfilePanel({ user, isPremium, onLogout, onUserUpdate }: ProfilePanelProps) {
  const [tab, setTab] = useState<"profile" | "account" | "appearance">("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("violet");
  const [status, setStatus] = useState("online");
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    display_name: String(user?.display_name || ""),
    username: String(user?.username || ""),
    email: String(user?.email || ""),
    bio: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const token = localStorage.getItem("volna_token");

  const saveProfile = async () => {
    if (form.new_password && form.new_password !== form.confirm_password) {
      setError("Пароли не совпадают"); return;
    }
    setError(""); setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (form.display_name) body.display_name = form.display_name;
      if (form.email !== String(user?.email || "")) body.email = form.email;
      if (form.new_password) {
        body.new_password = form.new_password;
        body.current_password = form.current_password;
      }

      const res = await fetch(`${AUTH_URL}/?action=update`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token || "" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сервера");

      const updated = { ...user, ...data.user };
      localStorage.setItem("volna_user", JSON.stringify(updated));
      onUserUpdate?.(updated);
      setForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка соединения");
    } finally {
      setSaving(false);
    }
  };

  const displayInitial = (form.display_name || form.username || "?")[0].toUpperCase();
  const selectedTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  const TABS = [
    { id: "profile",    icon: "User",       label: "Профиль" },
    { id: "account",    icon: "Settings",   label: "Аккаунт" },
    { id: "appearance", icon: "Palette",    label: "Вид" },
  ] as const;

  return (
    <div className="flex-1 flex flex-col min-w-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 glass-strong">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center">
          <Icon name="User" size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-white text-sm">Профиль</h2>
          <span className="text-xs text-white/35">@{form.username || "username"}</span>
        </div>
        <button
          onClick={onLogout}
          title="Выйти из аккаунта"
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
        >
          <Icon name="LogOut" size={13} />
          Выйти
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pt-4">
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

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <>
            {/* Avatar block */}
            <div className="glass rounded-2xl p-5 flex flex-col items-center gap-3">
              <div className="relative group">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedTheme.from} ${selectedTheme.to} flex items-center justify-center text-white text-3xl font-black shadow-lg`}>
                  {displayInitial}
                </div>
                <button className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon name="Camera" size={20} className="text-white" />
                </button>
                {isPremium && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow">
                    <Icon name="Crown" size={12} className="text-white" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="font-bold text-white text-base">{form.display_name || "Ваше имя"}</p>
                <p className="text-xs text-white/35 mt-0.5">@{form.username}</p>
              </div>
              {/* Status picker */}
              <div className="flex gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatus(s.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all
                      ${status === s.id ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${s.color}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3">
              {[
                { key: "display_name", label: "Отображаемое имя", icon: "User", placeholder: "Как вас зовут?" },
                { key: "username",     label: "Имя пользователя", icon: "AtSign", placeholder: "username" },
                { key: "bio",          label: "О себе",           icon: "FileText", placeholder: "Расскажите о себе…" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-white/40 mb-1.5 block">{f.label}</label>
                  <div className="relative">
                    <Icon name={f.icon} fallback="Circle" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ACCOUNT ── */}
        {tab === "account" && (
          <>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Email</label>
                <div className="relative">
                  <Icon name="Mail" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60 transition-colors"
                  />
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <p className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-wide">Смена пароля</p>
                <div className="flex flex-col gap-2.5">
                  {[
                    { key: "current_password", label: "Текущий пароль" },
                    { key: "new_password",     label: "Новый пароль" },
                    { key: "confirm_password", label: "Повторите новый пароль" },
                  ].map((f) => (
                    <div key={f.key} className="relative">
                      <Icon name="Lock" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => set(f.key, e.target.value)}
                        placeholder={f.label}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60 transition-colors"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                        <Icon name={showPass ? "EyeOff" : "Eye"} size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium block */}
            {!isPremium && (
              <div className="glass rounded-xl p-4 border border-amber-500/15">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Icon name="Crown" size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-300">Volna Premium</p>
                    <p className="text-xs text-white/35">Разблокируйте все возможности</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {["Видеозвонки", "Скрытый статус", "Кастомные темы", "2FA защита"].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-white/50">
                      <Icon name="Check" size={11} className="text-amber-400" />
                      {f}
                    </div>
                  ))}
                </div>
                <button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold py-2 rounded-xl hover:scale-[1.02] transition-transform">
                  Перейти на Premium
                </button>
              </div>
            )}

            {isPremium && (
              <div className="glass rounded-xl p-4 border border-amber-500/15">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Icon name="Crown" size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-300">Premium активен</p>
                    <p className="text-xs text-white/35">Все функции разблокированы</p>
                  </div>
                  <Icon name="CheckCircle" size={18} className="text-emerald-400 ml-auto" />
                </div>
              </div>
            )}

            {/* Danger zone */}
            <div className="glass rounded-xl p-4 border border-red-500/10">
              <p className="text-xs font-semibold text-red-400/70 mb-2 uppercase tracking-wide">Опасная зона</p>
              <button className="w-full text-sm text-red-400/70 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 py-2 rounded-xl transition-colors">
                Удалить аккаунт
              </button>
            </div>
          </>
        )}

        {/* ── APPEARANCE ── */}
        {tab === "appearance" && (
          <>
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wide">Цвет профиля</p>
              <div className="flex gap-2 flex-wrap">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-1.5 transition-all`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.from} ${t.to} transition-all
                      ${theme === t.id ? "ring-2 ring-white/50 scale-110" : "opacity-60 hover:opacity-90"}`}
                    />
                    <span className="text-xs text-white/35">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-4">
              <p className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wide">Размер текста</p>
              <div className="flex gap-2">
                {[{ label: "S", size: "text-xs" }, { label: "M", size: "text-sm" }, { label: "L", size: "text-base" }].map((s, i) => (
                  <button key={s.label}
                    className={`flex-1 py-2 rounded-xl border transition-all ${i === 1 ? "border-violet-500/50 bg-violet-500/15 text-violet-300" : "border-white/10 text-white/35 hover:text-white/60"}`}
                  >
                    <span className={s.size}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-4">
              <p className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wide">Интерфейс</p>
              {[
                { label: "Компактный режим",    desc: "Уменьшенные отступы и аватары" },
                { label: "Анимации",            desc: "Плавные переходы и эффекты" },
                { label: "Звуки уведомлений",   desc: "Звук при получении сообщения" },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between py-2.5 ${i < 2 ? "border-b border-white/5" : ""}`}>
                  <div>
                    <p className="text-sm text-white/80">{item.label}</p>
                    <p className="text-xs text-white/30">{item.desc}</p>
                  </div>
                  <button className="w-10 rounded-full bg-violet-500 flex items-center relative flex-shrink-0" style={{ minWidth: "2.5rem", height: "1.375rem" }}>
                    <span className="absolute w-4 h-4 bg-white rounded-full shadow" style={{ left: "calc(100% - 1.125rem)" }} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Save button */}
        {(tab === "profile" || tab === "account") && (
          <>
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <Icon name="AlertCircle" size={14} className="text-red-400" />
                <span className="text-xs text-red-400">{error}</span>
              </div>
            )}
            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full gradient-bg text-white font-semibold py-2.5 rounded-xl neon-glow-purple hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Сохраняю…</span></>
              ) : saved ? (
                <><Icon name="CheckCircle" size={16} /><span>Сохранено!</span></>
              ) : (
                <><Icon name="Save" size={16} /><span>Сохранить изменения</span></>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}