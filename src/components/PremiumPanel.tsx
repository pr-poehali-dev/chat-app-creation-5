import { useState } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/3b8b4e86-99bb-44fb-8a3d-f78f5859ee58";

interface PremiumPanelProps {
  isPremium?: boolean;
  onActivated?: () => void;
}

const PLANS = [
  {
    id: "premium",
    label: "Premium",
    price: "299 ₽",
    period: "в месяц",
    color: "from-violet-600 to-purple-700",
    glow: "neon-glow-purple",
    badge: null,
    features: [
      "Сквозное шифрование E2E",
      "Двухфакторная аутентификация",
      "Видеозвонки до 2 часов",
      "Файлы до 2 ГБ",
      "5 кастомных тем",
      "Скрытый статус онлайн",
      "Приоритетная поддержка",
    ],
  },
  {
    id: "premium_pro",
    label: "Premium Pro",
    price: "799 ₽",
    period: "в год",
    color: "from-amber-400 to-orange-500",
    glow: "",
    badge: "Выгода 78%",
    features: [
      "Всё из Premium",
      "Неограниченные звонки",
      "Файлы до 20 ГБ",
      "Безлимитные темы",
      "Антискриншот",
      "Анонимный режим",
      "Ранний доступ к функциям",
      "Персональный менеджер",
    ],
  },
];

const FEATURES_SHOWCASE = [
  {
    icon: "ShieldCheck", color: "from-violet-500 to-purple-700",
    title: "Максимальная защита",
    desc: "E2E шифрование + 2FA + антискриншот",
  },
  {
    icon: "Video", color: "from-blue-500 to-cyan-500",
    title: "HD Видеозвонки",
    desc: "Кристально чистое изображение без ограничений",
  },
  {
    icon: "HardDrive", color: "from-emerald-500 to-teal-600",
    title: "Облачное хранилище",
    desc: "До 20 ГБ для файлов, фото и видео",
  },
  {
    icon: "Palette", color: "from-pink-500 to-rose-600",
    title: "Кастомные темы",
    desc: "Безлимитные темы и персонализация",
  },
  {
    icon: "EyeOff", color: "from-amber-500 to-orange-500",
    title: "Анонимный режим",
    desc: "Скрытый статус, невидимый просмотр",
  },
  {
    icon: "Zap", color: "from-indigo-500 to-blue-600",
    title: "Ранний доступ",
    desc: "Новые функции раньше всех остальных",
  },
];

export default function PremiumPanel({ isPremium, onActivated }: PremiumPanelProps) {
  const [selectedPlan, setSelectedPlan] = useState("premium_pro");
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem("volna_token");

  const activate = async () => {
    if (!token) { setError("Требуется авторизация"); return; }
    setError(""); setActivating(true);
    try {
      const res = await fetch(`${AUTH_URL}/?action=activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка активации");
      setSuccess(true);
      setTimeout(() => onActivated?.(), 1800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка соединения");
    } finally {
      setActivating(false);
    }
  };

  if (isPremium) {
    return (
      <div className="flex-1 flex flex-col min-w-0 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 glass-strong">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Icon name="Crown" size={17} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">Volna Premium</h2>
            <span className="text-xs text-emerald-400">Активен · Все функции доступны</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">
          {/* Active badge */}
          <div className="glass rounded-2xl p-6 flex flex-col items-center text-center border border-amber-500/20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg" style={{ boxShadow: "0 0 40px rgba(251, 191, 36, 0.3)" }}>
              <Icon name="Crown" size={36} className="text-white" />
            </div>
            <h3 className="text-2xl font-black gradient-text mb-1">Premium активен</h3>
            <p className="text-white/40 text-sm">Вы используете полную версию Volna</p>
            <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
              <Icon name="CheckCircle" size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Все 8 возможностей разблокированы</span>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES_SHOWCASE.map((f) => (
              <div key={f.title} className="glass rounded-xl p-3 flex flex-col gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                  <Icon name={f.icon} fallback="Star" size={15} className="text-white" />
                </div>
                <p className="text-xs font-semibold text-white/80">{f.title}</p>
                <p className="text-xs text-white/30 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 glass-strong">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Icon name="Crown" size={17} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-sm">Volna Premium</h2>
          <span className="text-xs text-white/35">Разблокируй все возможности</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        {/* Hero */}
        <div className="relative glass rounded-2xl p-5 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/8 rounded-full blur-2xl" />
          </div>
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Icon name="Crown" size={26} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Стань Premium</h3>
              <p className="text-xs text-white/40 mt-0.5 leading-relaxed">Максимальная защита, HD звонки<br />и полная свобода общения</p>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="flex flex-col gap-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full glass rounded-2xl p-4 text-left transition-all duration-200 relative overflow-hidden
                ${selectedPlan === plan.id ? "border border-amber-500/40 bg-amber-500/5" : "border border-white/8 hover:border-white/15"}`}
            >
              {plan.badge && (
                <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <Icon name="Crown" size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{plan.label}</p>
                  <p className="text-xs text-white/35">{plan.period}</p>
                </div>
                <div className="ml-auto mr-8 text-right">
                  <span className="text-xl font-black text-white">{plan.price}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-white/50">
                    <Icon name="Check" size={11} className="text-emerald-400 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              {selectedPlan === plan.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-l-2xl" />
              )}
            </button>
          ))}
        </div>

        {/* Features grid */}
        <div>
          <p className="text-xs text-white/25 uppercase tracking-wide font-medium mb-3">Что вы получите</p>
          <div className="grid grid-cols-2 gap-2.5">
            {FEATURES_SHOWCASE.map((f) => (
              <div key={f.title} className="glass rounded-xl p-3 flex items-start gap-2.5">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon name={f.icon} fallback="Star" size={13} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/80">{f.title}</p>
                  <p className="text-xs text-white/30 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
            <Icon name="AlertCircle" size={14} className="text-red-400" />
            <span className="text-xs text-red-400">{error}</span>
          </div>
        )}

        {success ? (
          <div className="flex items-center justify-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl py-4 animate-fade-in">
            <Icon name="CheckCircle" size={20} className="text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">Premium активирован!</span>
          </div>
        ) : (
          <button
            onClick={activate}
            disabled={activating}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-3.5 rounded-2xl hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            style={{ boxShadow: "0 8px 30px rgba(251, 191, 36, 0.25)" }}
          >
            {activating ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Активирую…</span></>
            ) : (
              <><Icon name="Crown" size={16} /><span>Активировать {PLANS.find((p) => p.id === selectedPlan)?.label}</span></>
            )}
          </button>
        )}

        <p className="text-center text-xs text-white/20 pb-2">
          Отмена в любое время · Безопасная оплата
        </p>
      </div>
    </div>
  );
}
