import { useState } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/3b8b4e86-99bb-44fb-8a3d-f78f5859ee58";

interface AuthScreenProps {
  onAuth: (token: string, user: Record<string, unknown>, isPremium: boolean) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    display_name: "",
  });

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*()_+={}|;:,.<>?]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = ["", "Слабый", "Средний", "Хороший", "Надёжный"][strength];
  const strengthColor = ["", "bg-red-500", "bg-amber-400", "bg-blue-400", "bg-emerald-400"][strength];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = mode === "login"
        ? { login: form.username || form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password, display_name: form.display_name || form.username };

      const res = await fetch(`${AUTH_URL}/?action=${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сервера");
      localStorage.setItem("volna_token", data.token);
      localStorage.setItem("volna_user", JSON.stringify(data.user));
      onAuth(data.token, data.user, data.is_premium);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-mesh items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/6 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto mb-4 flex items-center justify-center neon-glow-purple">
            <span className="text-white font-black text-2xl">V</span>
          </div>
          <h1 className="text-3xl font-black gradient-text">Volna</h1>
          <p className="text-white/35 text-sm mt-1">Защищённый мессенджер</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${mode === m ? "gradient-bg text-white shadow-lg" : "text-white/40 hover:text-white/70"}`}
              >
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Имя пользователя</label>
                  <div className="relative">
                    <Icon name="AtSign" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      value={form.username}
                      onChange={(e) => set("username", e.target.value)}
                      placeholder="только латиница и _"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Email</label>
                  <div className="relative">
                    <Icon name="Mail" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "login" && (
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Логин или Email</label>
                <div className="relative">
                  <Icon name="User" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    placeholder="username или email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Пароль</label>
              <div className="relative">
                <Icon name="Lock" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder={mode === "register" ? "Мин. 8 симв., заглавная, цифра, спецсимвол" : "Пароль"}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60 transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  <Icon name={showPass ? "EyeOff" : "Eye"} size={15} />
                </button>
              </div>
              {mode === "register" && form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= i ? strengthColor : "bg-white/10"}`} />
                    ))}
                  </div>
                  <span className={`text-xs ${["", "text-red-400", "text-amber-400", "text-blue-400", "text-emerald-400"][strength]}`}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 animate-fade-in">
                <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white font-semibold py-3 rounded-xl neon-glow-purple hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Загрузка...</span>
                </>
              ) : (
                <>
                  <Icon name={mode === "login" ? "LogIn" : "UserPlus"} size={16} />
                  <span>{mode === "login" ? "Войти" : "Создать аккаунт"}</span>
                </>
              )}
            </button>
          </form>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-white/5">
            <Icon name="ShieldCheck" size={13} className="text-violet-400/60" />
            <span className="text-xs text-white/25">Сквозное шифрование · Нулевые логи · E2E</span>
          </div>
        </div>

        {/* Premium hint */}
        <div className="mt-4 glass rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Icon name="Crown" size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-300">Volna Premium</p>
            <p className="text-xs text-white/30">Видеозвонки, приоритет, кастомные темы</p>
          </div>
        </div>
      </div>
    </div>
  );
}