import { useState, useEffect } from "react";
import { Save, CheckCircle, Plus, Trash2, ChevronDown, ChevronUp, Wifi, WifiOff, Loader2 } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/user_69af5468cf5d5a8b668927e7/aa22ee38d_ueiiblue.png";
const DEFAULT = {
  name: "", personality: "", communicationStyle: "", systemPrompt: "",
  apiKey: "", model: "gemma3:12b", audioApiKey: "", videoApiKey: "",
  customEndpoint: "",
  // LOCAL MODEL SETTINGS
  useLocalModel: true,
  ollamaHost: "http://localhost:11434",
  ollamaCustomModel: "",
};

const OLLAMA_PRESETS = [
  "gemma3:12b", "gemma3:4b", "gemma:7b", "gemma:2b",
  "llama3", "llama3:8b", "llama3:70b",
  "llama3.2", "llama3.2:3b", "llama3.1", "llama3.1:8b",
  "mistral", "mistral:7b", "mixtral", "mixtral:8x7b",
  "phi3", "phi3:mini", "phi3:medium",
  "deepseek-r1", "deepseek-r1:7b", "deepseek-r1:14b", "deepseek-r1:32b",
  "qwen2.5", "qwen2.5:7b", "qwen2.5:14b",
  "codellama", "codellama:7b", "codellama:13b",
  "dolphin-mixtral", "neural-chat", "starling-lm",
  "custom",
];

const OPENAI_MODELS = [
  "gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo",
];

export default function IdentityPanel() {
  const [id, setId] = useState(DEFAULT);
  const [skills, setSkills] = useState([]);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("identity");
  const [newSkill, setNewSkill] = useState({ name: "", instruction: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [ollamaTestStatus, setOllamaTestStatus] = useState(null); // null | "testing" | "ok" | "fail"
  const [ollamaModels, setOllamaModels] = useState([]);

  useEffect(() => {
    try {
      setId({ ...DEFAULT, ...JSON.parse(localStorage.getItem("said_identity") || "{}") });
      setSkills(JSON.parse(localStorage.getItem("said_skills") || "[]"));
    } catch {}
  }, []);

  const saveId = () => {
    localStorage.setItem("said_identity", JSON.stringify(id));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveSkill = () => {
    if (!newSkill.name.trim() || !newSkill.instruction.trim()) return;
    const updated = [...skills, { id: Date.now(), ...newSkill }];
    setSkills(updated);
    localStorage.setItem("said_skills", JSON.stringify(updated));
    setNewSkill({ name: "", instruction: "" });
    setShowAdd(false);
  };

  const deleteSkill = (sid) => {
    const u = skills.filter(s => s.id !== sid);
    setSkills(u);
    localStorage.setItem("said_skills", JSON.stringify(u));
  };

  const testOllama = async () => {
    setOllamaTestStatus("testing");
    setOllamaModels([]);
    try {
      const host = id.ollamaHost || "http://localhost:11434";
      const res = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const models = (data.models || []).map(m => m.name);
      setOllamaModels(models);
      setOllamaTestStatus("ok");
    } catch (e) {
      setOllamaTestStatus("fail");
    }
  };

  const field = (key, label, placeholder, type = "text", rows = 0) => (
    <div>
      <label className="text-xs font-mono text-gray-600 uppercase tracking-widest block mb-1.5">{label}</label>
      {rows > 0
        ? <textarea value={id[key] || ""} onChange={e => setId(i => ({ ...i, [key]: e.target.value }))}
            placeholder={placeholder} rows={rows}
            className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-700 font-mono resize-none outline-none"
            style={{ background: "#0d0d1a", border: "1px solid #1a1a2e" }} />
        : <input type={type} value={id[key] || ""} onChange={e => setId(i => ({ ...i, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-700 font-mono outline-none"
            style={{ background: "#0d0d1a", border: "1px solid #1a1a2e" }} />}
    </div>
  );

  const selectedModelInList = OLLAMA_PRESETS.includes(id.model) || OPENAI_MODELS.includes(id.model);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 px-4 pt-4 flex-shrink-0">
        {["identity", "api", "skills"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-xs font-mono uppercase tracking-widest transition-all ${tab === t ? "text-blue-300 border-b-2 border-blue-500" : "text-gray-700 border-b-2 border-transparent hover:text-gray-400"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="h-px mx-4 mb-4 flex-shrink-0" style={{ background: "#1a1a2e" }} />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tab === "identity" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#0a0a14", border: "1px solid #1a1a2e" }}>
              <img src={LOGO} alt="MYM Logic" className="w-12 h-12 object-contain"
                style={{ filter: "drop-shadow(0 0 10px rgba(59,130,246,.6))" }} />
              <div>
                <p className="said-title text-blue-400 font-bold text-sm">S.A.I.D.</p>
                <p className="text-xs text-gray-600 font-mono">STRATEGIC ANALYTICAL INFORMATION DEPLOYMENT</p>
                <p className="text-xs text-blue-900 font-mono">MYM LOGIC LLC</p>
              </div>
            </div>
            {field("name", "Assistant Name", "e.g. NOVA, AXIOM, or leave blank for S.A.I.D.")}
            {field("personality", "Personality", "e.g. Blunt, analytical, creative, fearless...", "text", 3)}
            {field("communicationStyle", "Communication Style", "e.g. Direct and technical, verbose, bullet-points...", "text", 2)}
            {field("systemPrompt", "Core System Directive", "Define exactly how this AI thinks and operates. Zero restrictions.", "text", 7)}
          </div>
        )}

        {tab === "api" && (
          <div className="flex flex-col gap-5">

            {/* ── ENGINE MODE TOGGLE ── */}
            <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "#0a0a14", border: "1px solid #1a2744" }}>
              <p className="text-xs font-mono text-blue-700 uppercase tracking-widest">Engine Mode</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setId(i => ({ ...i, useLocalModel: true }))}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all border ${id.useLocalModel ? "text-green-300 border-green-700" : "text-gray-600 border-gray-800 hover:border-gray-600"}`}
                  style={{ background: id.useLocalModel ? "#0a1f0a" : "#0d0d1a" }}>
                  🖥️ Local (Ollama)
                </button>
                <button
                  onClick={() => setId(i => ({ ...i, useLocalModel: false }))}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all border ${!id.useLocalModel ? "text-blue-300 border-blue-700" : "text-gray-600 border-gray-800 hover:border-gray-600"}`}
                  style={{ background: !id.useLocalModel ? "#050f1a" : "#0d0d1a" }}>
                  ☁️ API (Cloud)
                </button>
              </div>
              <p className="text-[10px] font-mono text-gray-700">
                {id.useLocalModel
                  ? "Runs 100% locally via Ollama. No API key required. No data leaves your machine."
                  : "Uses a cloud API (OpenAI, OpenRouter, etc). Requires API key below."}
              </p>
            </div>

            {/* ── LOCAL OLLAMA SETTINGS ── */}
            {id.useLocalModel && (
              <div className="flex flex-col gap-3 rounded-xl p-4" style={{ background: "#060f06", border: "1px solid #1a3a1a" }}>
                <p className="text-xs font-mono text-green-800 uppercase tracking-widest">Ollama Configuration</p>

                {/* Host */}
                <div>
                  <label className="text-xs font-mono text-gray-600 uppercase tracking-widest block mb-1.5">Ollama Host</label>
                  <input
                    value={id.ollamaHost || "http://localhost:11434"}
                    onChange={e => setId(i => ({ ...i, ollamaHost: e.target.value }))}
                    placeholder="http://localhost:11434"
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-700 font-mono outline-none"
                    style={{ background: "#0d0d1a", border: "1px solid #1a2e1a" }} />
                </div>

                {/* Model selector */}
                <div>
                  <label className="text-xs font-mono text-gray-600 uppercase tracking-widest block mb-1.5">Model</label>
                  <select
                    value={OLLAMA_PRESETS.includes(id.model) ? id.model : "custom"}
                    onChange={e => {
                      if (e.target.value !== "custom") setId(i => ({ ...i, model: e.target.value, ollamaCustomModel: "" }));
                      else setId(i => ({ ...i, model: i.ollamaCustomModel || "" }));
                    }}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 font-mono outline-none mb-2"
                    style={{ background: "#0d0d1a", border: "1px solid #1a2e1a" }}>
                    {OLLAMA_PRESETS.map(m => <option key={m} value={m}>{m === "custom" ? "── Enter custom model name" : m}</option>)}
                  </select>
                  {/* Custom model input */}
                  {(!OLLAMA_PRESETS.includes(id.model) || id.model === "custom") && (
                    <input
                      value={id.ollamaCustomModel || id.model || ""}
                      onChange={e => setId(i => ({ ...i, model: e.target.value, ollamaCustomModel: e.target.value }))}
                      placeholder="e.g. llama3:latest, my-custom-model:7b"
                      className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-700 font-mono outline-none"
                      style={{ background: "#0d0d1a", border: "1px solid #1a2e1a" }} />
                  )}
                </div>

                {/* Test connection */}
                <button onClick={testOllama}
                  disabled={ollamaTestStatus === "testing"}
                  className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all border"
                  style={{
                    background: ollamaTestStatus === "ok" ? "#0a1f0a" : ollamaTestStatus === "fail" ? "#1f0a0a" : "#0d0d1a",
                    border: ollamaTestStatus === "ok" ? "1px solid #16a34a" : ollamaTestStatus === "fail" ? "1px solid #dc2626" : "1px solid #1a3a1a",
                    color: ollamaTestStatus === "ok" ? "#22c55e" : ollamaTestStatus === "fail" ? "#ef4444" : "#4b8a4b",
                  }}>
                  {ollamaTestStatus === "testing" && <Loader2 size={11} className="animate-spin" />}
                  {ollamaTestStatus === "ok" && <Wifi size={11} />}
                  {ollamaTestStatus === "fail" && <WifiOff size={11} />}
                  {!ollamaTestStatus && <Wifi size={11} />}
                  {ollamaTestStatus === "testing" ? "TESTING..." : ollamaTestStatus === "ok" ? "OLLAMA CONNECTED" : ollamaTestStatus === "fail" ? "CONNECTION FAILED" : "TEST OLLAMA CONNECTION"}
                </button>

                {/* Discovered models */}
                {ollamaModels.length > 0 && (
                  <div className="rounded-lg p-3" style={{ background: "#0d0d1a", border: "1px solid #1a3a1a" }}>
                    <p className="text-[10px] font-mono text-green-700 uppercase tracking-widest mb-2">Models installed on this machine:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ollamaModels.map(m => (
                        <button key={m} onClick={() => setId(i => ({ ...i, model: m, ollamaCustomModel: "" }))}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all border ${id.model === m ? "text-green-300 border-green-700 bg-green-950" : "text-gray-500 border-gray-800 hover:border-green-800 hover:text-green-400"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {ollamaTestStatus === "fail" && (
                  <div className="rounded-lg p-3 text-[10px] font-mono text-red-800" style={{ background: "#1a0a0a", border: "1px solid #3a1a1a" }}>
                    <p className="mb-1 text-red-600 font-bold">Cannot reach Ollama.</p>
                    <p>• Make sure Ollama is installed and running: <span className="text-red-400">ollama serve</span></p>
                    <p>• Default host is <span className="text-red-400">http://localhost:11434</span></p>
                    <p>• If running on another machine, update the host above and make sure CORS is enabled.</p>
                    <p className="mt-1">Install Ollama: <span className="text-red-400">https://ollama.com</span></p>
                  </div>
                )}
              </div>
            )}

            {/* ── CLOUD API SETTINGS ── */}
            {!id.useLocalModel && (
              <div className="flex flex-col gap-3 rounded-xl p-4" style={{ background: "#05080f", border: "1px solid #0d2a4a" }}>
                <p className="text-xs font-mono text-blue-800 uppercase tracking-widest">Cloud API Configuration</p>
                <div className="p-3 rounded-lg text-xs font-mono text-blue-700" style={{ background: "#050f1a", border: "1px solid #0d2a4a" }}>
                  Keys stored locally only. Never sent anywhere except the configured endpoint.
                </div>

                {/* Cloud model selector */}
                <div>
                  <label className="text-xs font-mono text-gray-600 uppercase tracking-widest block mb-1.5">Model</label>
                  <select
                    value={OPENAI_MODELS.includes(id.model) ? id.model : "custom"}
                    onChange={e => { if (e.target.value !== "custom") setId(i => ({ ...i, model: e.target.value })); }}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 font-mono outline-none"
                    style={{ background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
                    {OPENAI_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                    <option value="custom">── Enter custom model ID</option>
                  </select>
                  {!OPENAI_MODELS.includes(id.model) && (
                    <input
                      value={id.model}
                      onChange={e => setId(i => ({ ...i, model: e.target.value }))}
                      placeholder="e.g. openrouter/auto, anthropic/claude-3.5-sonnet"
                      className="w-full rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-700 font-mono outline-none mt-2"
                      style={{ background: "#0d0d1a", border: "1px solid #1a1a2e" }} />
                  )}
                </div>

                {field("apiKey", "API Key", "sk-...", "password")}
                {field("customEndpoint", "Custom Endpoint (OpenRouter, LM Studio, etc.)", "https://openrouter.ai/api/v1")}
                {field("audioApiKey", "Audio API Key (ElevenLabs/Suno)", "API key for audio generation", "password")}
                {field("videoApiKey", "Video API Key (Runway/Kling)", "API key for video generation", "password")}
              </div>
            )}
          </div>
        )}

        {tab === "skills" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="text-xs text-gray-700 font-mono leading-relaxed flex-1">
                Skills are named directives that change S.A.I.D.'s behavior for specific tasks.
              </p>
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono text-blue-400 border border-blue-900 hover:border-blue-600 flex-shrink-0">
                <Plus size={11} /> NEW
              </button>
            </div>
            {showAdd && (
              <div className="rounded-lg p-3 flex flex-col gap-2" style={{ background: "#0d1a2e", border: "1px solid #1e3a5f" }}>
                <input value={newSkill.name} onChange={e => setNewSkill(s => ({ ...s, name: e.target.value }))}
                  placeholder="Skill name"
                  className="w-full rounded px-3 py-2 text-xs font-mono text-gray-200 placeholder-gray-600 outline-none"
                  style={{ background: "#080812", border: "1px solid #1a1a2e" }} />
                <textarea value={newSkill.instruction} onChange={e => setNewSkill(s => ({ ...s, instruction: e.target.value }))}
                  placeholder="Describe exactly how S.A.I.D. behaves when this skill is active..."
                  rows={4} className="w-full rounded px-3 py-2 text-xs font-mono text-gray-200 placeholder-gray-600 outline-none resize-none"
                  style={{ background: "#080812", border: "1px solid #1a1a2e" }} />
                <div className="flex gap-2">
                  <button onClick={saveSkill}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono text-white"
                    style={{ background: "#1d4ed8" }}>
                    <Save size={11} /> SAVE
                  </button>
                  <button onClick={() => { setShowAdd(false); setNewSkill({ name: "", instruction: "" }); }}
                    className="text-gray-600 text-xs px-2">CANCEL</button>
                </div>
              </div>
            )}
            {skills.length === 0 && !showAdd && (
              <div className="text-center mt-12 opacity-25">
                <p className="text-gray-600 text-sm font-mono">No skills defined</p>
              </div>
            )}
            {skills.map(skill => (
              <div key={skill.id} className="rounded-lg overflow-hidden" style={{ background: "#0d0d14", border: "1px solid #1a1a2e" }}>
                <div className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => setExpanded(expanded === skill.id ? null : skill.id)}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-sm font-mono text-gray-300">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); deleteSkill(skill.id); }}
                      className="text-gray-700 hover:text-red-400"><Trash2 size={12} /></button>
                    {expanded === skill.id ? <ChevronUp size={13} className="text-gray-600" /> : <ChevronDown size={13} className="text-gray-600" />}
                  </div>
                </div>
                {expanded === skill.id && (
                  <div className="px-4 pb-3 border-t" style={{ borderColor: "#1a1a2e" }}>
                    <p className="text-xs font-mono text-gray-500 leading-relaxed pt-3 whitespace-pre-wrap">{skill.instruction}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {tab !== "skills" && (
        <div className="flex-shrink-0 px-4 py-3 flex justify-end"
          style={{ borderTop: "1px solid #1a1a2e", background: "#080812" }}>
          <button onClick={saveId}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-mono text-white"
            style={{
              background: saved ? "#16a34a" : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
              boxShadow: "0 0 12px rgba(59,130,246,.3)"
            }}>
            {saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saved ? "SAVED" : "SAVE IDENTITY"}
          </button>
        </div>
      )}
    </div>
  );
}
