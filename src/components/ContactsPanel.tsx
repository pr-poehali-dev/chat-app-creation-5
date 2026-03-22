import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const CLIENTS_URL = "https://functions.poehali.dev/219a6156-5b9b-413c-bd28-48238156663d";

interface Contact {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  birthday?: string;
  status?: string;
  source?: string;
  notes?: string;
  city?: string;
  tags?: string[];
  avatar_url?: string;
  created_at?: string;
}

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-500",
  "from-indigo-500 to-blue-600",
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  active:   { label: "Активен",   color: "bg-emerald-400" },
  inactive: { label: "Неактивен", color: "bg-gray-500" },
  vip:      { label: "VIP",       color: "bg-amber-400" },
  blocked:  { label: "Заблокирован", color: "bg-red-400" },
};

const SOURCES = ["Все", "website", "referral", "social", "ads", "other"];

interface ContactsPanelProps {
  onStartChat?: (name: string) => void;
}

export default function ContactsPanel({ onStartChat }: ContactsPanelProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "", phone: "", email: "", company: "",
    city: "", birthday: "", status: "active", source: "", notes: "",
  });
  const setF = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "50");
      const res = await fetch(`${CLIENTS_URL}/?${params}`);
      const data = await res.json();
      setContacts(data.clients || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const saveContact = async () => {
    if (!form.name.trim()) { setFormError("Имя обязательно"); return; }
    setFormError(""); setSaving(true);
    try {
      const res = await fetch(`${CLIENTS_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сервера");
      setShowForm(false);
      setForm({ name: "", phone: "", email: "", company: "", city: "", birthday: "", status: "active", source: "", notes: "" });
      fetchContacts();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const getInitial = (name: string) => name.trim()[0]?.toUpperCase() || "?";
  const getGradient = (id: number) => AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];

  return (
    <div className="flex-1 flex min-w-0 animate-fade-in">

      {/* List */}
      <div className={`flex flex-col border-r border-white/5 transition-all duration-200 ${selected ? "w-72" : "flex-1"}`}>
        {/* Header */}
        <div className="p-4 border-b border-white/5 glass-strong">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-sm">Контакты</h2>
              <span className="text-xs bg-white/8 text-white/40 px-2 py-0.5 rounded-full">{total}</span>
            </div>
            <button
              onClick={() => { setShowForm(true); setSelected(null); }}
              className="flex items-center gap-1.5 text-xs bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-2.5 py-1.5 rounded-xl transition-colors"
            >
              <Icon name="UserPlus" size={13} />
              Добавить
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, телефону, email…"
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-xs text-white/80 placeholder-white/25 outline-none focus:border-violet-500/40 transition-colors"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1 overflow-x-auto">
            {["", "active", "vip", "inactive"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs transition-colors
                  ${statusFilter === s ? "bg-violet-500/20 text-violet-300" : "text-white/30 hover:text-white/60"}`}
              >
                {s === "" ? "Все" : STATUS_META[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                <Icon name="Users" size={22} className="text-white/20" />
              </div>
              <p className="text-white/30 text-sm mb-1">Контактов нет</p>
              <p className="text-white/20 text-xs">Добавьте первый контакт</p>
            </div>
          ) : contacts.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelected(c); setShowForm(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl transition-all duration-150 text-left
                ${selected?.id === c.id ? "bg-violet-500/15 border border-violet-500/20" : "hover:bg-white/4 border border-transparent"}`}
              style={{ width: "calc(100% - 8px)" }}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getGradient(c.id)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {getInitial(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/90 truncate">{c.name}</span>
                  {c.status && c.status !== "active" && (
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_META[c.status]?.color || "bg-gray-400"}`} />
                  )}
                </div>
                <p className="text-xs text-white/35 truncate">{c.phone || c.email || c.company || "—"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail / Form */}
      {showForm ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 glass-strong">
            <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/70 transition-colors">
              <Icon name="ArrowLeft" size={16} />
            </button>
            <h3 className="font-semibold text-white text-sm">Новый контакт</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "name",    label: "Имя *",         icon: "User",     type: "text",  full: true },
                { key: "phone",   label: "Телефон",       icon: "Phone",    type: "tel",   full: false },
                { key: "email",   label: "Email",         icon: "Mail",     type: "email", full: false },
                { key: "company", label: "Компания",      icon: "Building", type: "text",  full: false },
                { key: "city",    label: "Город",         icon: "MapPin",   type: "text",  full: false },
                { key: "birthday",label: "День рождения", icon: "Cake",     type: "date",  full: false },
              ].map((f) => (
                <div key={f.key} className={f.full ? "col-span-2" : ""}>
                  <label className="text-xs text-white/40 mb-1.5 block">{f.label}</label>
                  <div className="relative">
                    <Icon name={f.icon} fallback="Circle" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type={f.type}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setF(f.key, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Статус</label>
                <select value={form.status} onChange={(e) => setF("status", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-500/50"
                >
                  {Object.entries(STATUS_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Источник</label>
                <select value={form.source} onChange={(e) => setF("source", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-500/50"
                >
                  {SOURCES.map((s) => <option key={s} value={s === "Все" ? "" : s}>{s}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-white/40 mb-1.5 block">Заметки</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setF("notes", e.target.value)}
                  rows={3}
                  placeholder="Любые заметки о контакте…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <Icon name="AlertCircle" size={13} className="text-red-400" />
                <span className="text-xs text-red-400">{formError}</span>
              </div>
            )}

            <button onClick={saveContact} disabled={saving}
              className="w-full gradient-bg text-white font-semibold py-2.5 rounded-xl neon-glow-purple hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            >
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Сохраняю…</span></>
                : <><Icon name="UserPlus" size={15} /><span>Сохранить контакт</span></>
              }
            </button>
          </div>
        </div>
      ) : selected ? (
        <div className="flex-1 flex flex-col min-w-0 animate-slide-in-right">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 glass-strong">
            <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white/70 transition-colors">
              <Icon name="ArrowLeft" size={16} />
            </button>
            <h3 className="font-semibold text-white text-sm flex-1 truncate">{selected.name}</h3>
            <button
              onClick={() => onStartChat?.(selected.name)}
              title="Написать сообщение"
              className="flex items-center gap-1.5 text-xs bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-2.5 py-1.5 rounded-xl transition-colors"
            >
              <Icon name="MessageCircle" size={13} />
              Написать
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getGradient(selected.id)} flex items-center justify-center text-white text-3xl font-black shadow-lg`}>
                {getInitial(selected.name)}
              </div>
              <p className="font-bold text-white text-lg">{selected.name}</p>
              {selected.company && <p className="text-xs text-white/40">{selected.company}</p>}
              {selected.status && (
                <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/8`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[selected.status]?.color || "bg-gray-400"}`} />
                  <span className="text-white/60">{STATUS_META[selected.status]?.label || selected.status}</span>
                </span>
              )}
            </div>

            {/* Info */}
            <div className="glass rounded-xl px-4 py-1">
              {[
                { icon: "Phone",   color: "from-emerald-500 to-teal-600", label: "Телефон",  value: selected.phone },
                { icon: "Mail",    color: "from-blue-500 to-cyan-500",    label: "Email",    value: selected.email },
                { icon: "Building",color: "from-violet-500 to-purple-700",label: "Компания", value: selected.company },
                { icon: "MapPin",  color: "from-pink-500 to-rose-600",    label: "Город",    value: selected.city },
                { icon: "Cake",    color: "from-amber-500 to-orange-500", label: "День рождения", value: selected.birthday },
                { icon: "Globe",   color: "from-indigo-500 to-blue-600",  label: "Источник", value: selected.source },
              ].filter((r) => r.value).map((row, i, arr) => (
                <div key={row.label} className={`flex items-center gap-3 py-2.5 ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${row.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={row.icon} fallback="Circle" size={12} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/30">{row.label}</p>
                    <p className="text-sm text-white/80 truncate">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-white/30 mb-2 flex items-center gap-1.5">
                  <Icon name="FileText" size={11} />Заметки
                </p>
                <p className="text-sm text-white/60 leading-relaxed">{selected.notes}</p>
              </div>
            )}

            {selected.tags && selected.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selected.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-violet-500/15 text-violet-300 border border-violet-500/20 px-2.5 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-white/20 text-center">
              Добавлен {selected.created_at ? new Date(selected.created_at).toLocaleDateString("ru-RU") : "—"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Icon name="Users" size={26} className="text-white/20" />
            </div>
            <p className="text-white/30 text-sm">Выберите контакт</p>
          </div>
        </div>
      )}
    </div>
  );
}