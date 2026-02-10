"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AppSidebar from "@/components/app/sidebar";
import {
  User,
  Bell,
  Palette,
  Shield,
  CreditCard,
  LogOut,
  Camera,
  Check,
  Cpu,
  ExternalLink,
  Loader2,
  Unplug,
  RefreshCcw,
  Github,
  Globe2,
  Sparkles,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────

interface ProviderStatus {
  connected: boolean;
  email?: string;
  provider: string;
  expiresAt?: number;
  updatedAt?: number;
}

interface DeviceCodeData {
  userCode: string;
  verificationUri: string;
  deviceCode: string;
  expiresIn: number;
  interval: number;
}

// ── Provider metadata ────────────────────────────────────────

const PROVIDERS = [
  {
    id: "github-copilot" as const,
    name: "GitHub Copilot",
    description: "Access GPT-4o, GPT-4.1, Claude Sonnet 4 and more via your Copilot subscription",
    icon: Github,
    color: "text-[#333] dark:text-[#ccc]",
    bg: "bg-[#f5f5f5] dark:bg-[#141414]",
    border: "border-[#e0e0e0] dark:border-[#2a2a2a]",
    authType: "device-code" as const,
  },
  {
    id: "google-gemini-cli" as const,
    name: "Google Gemini",
    description: "Access Gemini 2.5 Pro, Gemini 2.5 Flash via Google Cloud",
    icon: Sparkles,
    color: "text-[#333] dark:text-[#ccc]",
    bg: "bg-[#f5f5f5] dark:bg-[#141414]",
    border: "border-[#e0e0e0] dark:border-[#2a2a2a]",
    authType: "oauth" as const,
  },
  {
    id: "google-antigravity" as const,
    name: "Google Antigravity",
    description: "Access Claude, Gemini and more via Google Antigravity platform",
    icon: Globe2,
    color: "text-[#333] dark:text-[#ccc]",
    bg: "bg-[#f5f5f5] dark:bg-[#141414]",
    border: "border-[#e0e0e0] dark:border-[#2a2a2a]",
    authType: "oauth" as const,
  },
];

// ── Main component ───────────────────────────────────────────

function applyTheme(t: string) {
  if (t === "dark" || (t === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("theme", t);
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("ai-providers");
  const [name, setName] = useState("YesLearn User");
  const [email, setEmail] = useState("");
  const [theme, setTheme] = useState("light");
  const [saved, setSaved] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  const handleThemeChange = (t: string) => {
    setTheme(t);
    applyTheme(t);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "ai-providers", label: "AI Providers", icon: Cpu },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Data & Privacy", icon: Shield },
  ];

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <h1 className="text-[28px] font-bold tracking-tight mb-1 dark:text-white">Settings</h1>
      <p className="text-[#666] dark:text-[#888] text-[15px] mb-8">Manage your AI providers and app preferences.</p>

      <div className="flex gap-8">
        {/* Settings Sidebar */}
        <div className="w-[200px] shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors text-left ${activeTab === tab.id
                  ? "bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333] text-black dark:text-white shadow-sm"
                  : "text-[#666] dark:text-[#888] hover:bg-white/50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {/* AI Providers Tab */}
          {activeTab === "ai-providers" && <AIProvidersTab />}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="bg-white dark:bg-[#111] rounded-2xl border border-[#e5e5e5] dark:border-[#222] p-6">
              <h2 className="text-[16px] font-semibold mb-6 dark:text-white">Appearance</h2>
              <div>
                <label className="block text-[13px] font-medium mb-3 dark:text-[#ccc]">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "light", label: "Light", preview: "bg-white border-[#e5e5e5]" },
                    { id: "dark", label: "Dark", preview: "bg-[#0a0a0a] border-[#333]" },
                    { id: "auto", label: "System", preview: "bg-gradient-to-r from-white to-[#0a0a0a] border-[#e5e5e5]" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${theme === t.id ? "border-black dark:border-white" : "border-[#e5e5e5] dark:border-[#333] hover:border-[#ccc]"
                        }`}
                    >
                      <div className={`w-full h-16 rounded-lg border mb-2 ${t.preview}`} />
                      <p className="text-[13px] font-medium dark:text-[#ccc]">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#111] rounded-2xl border border-[#e5e5e5] dark:border-[#222] p-6">
                <h2 className="text-[16px] font-semibold mb-2 dark:text-white">Data Storage</h2>
                <p className="text-[13px] text-[#999] mb-4">
                  All your data is stored locally on your computer in %APPDATA%/.YesLearn/
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#f8f8f8] dark:bg-[#141414]">
                    <div>
                      <p className="text-[14px] font-medium dark:text-white">Database</p>
                      <p className="text-[12px] text-[#999]">SQLite database with all your spaces and content</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#f8f8f8] dark:bg-[#141414]">
                    <div>
                      <p className="text-[14px] font-medium dark:text-white">Auth Credentials</p>
                      <p className="text-[12px] text-[#999]">AI provider tokens stored locally with restricted permissions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AI Providers Tab ─────────────────────────────────────────

function AIProvidersTab() {
  const [statuses, setStatuses] = useState<Record<string, ProviderStatus>>({});
  const [loading, setLoading] = useState(true);
  const [activeFlow, setActiveFlow] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setStatuses(data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-[#111] rounded-2xl border border-[#e5e5e5] dark:border-[#222] p-6 animate-pulse">
            <div className="h-5 bg-[#f1f1f1] dark:bg-[#222] rounded w-40 mb-2" />
            <div className="h-4 bg-[#f1f1f1] dark:bg-[#222] rounded w-64" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-[16px] font-semibold dark:text-white">AI Providers</h2>
        <p className="text-[13px] text-[#999] mt-1">
          Connect AI providers to enable chat, summaries, and quizzes. Your tokens are stored locally.
        </p>
      </div>

      {PROVIDERS.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          status={statuses[provider.id]}
          activeFlow={activeFlow}
          setActiveFlow={setActiveFlow}
          onStatusChange={fetchStatus}
        />
      ))}

      {/* Model Selector */}
      <ModelSelector />
    </div>
  );
}

// ── Model Selector ───────────────────────────────────────────

interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

function ModelSelector() {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch models and current selection in parallel
    Promise.all([
      fetch("/api/models").then(r => r.json()),
      fetch("/api/settings?key=default-model").then(r => r.json()),
    ]).then(([modelsData, settingData]) => {
      const fetchedModels = modelsData.models || [];
      setModels(fetchedModels);
      if (settingData.value) {
        setSelectedModel(settingData.value);
      } else if (fetchedModels.length > 0) {
        setSelectedModel(fetchedModels[0].id);
      }
    }).finally(() => setLoadingModels(false));
  }, []);

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "default-model", value: modelId }),
      });
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  };

  // Group models by provider
  const groupedModels = models.reduce<Record<string, ModelOption[]>>((acc, m) => {
    const key = m.provider === "github-copilot" ? "GitHub Copilot" : m.provider === "google-gemini-cli" ? "Google Gemini" : m.provider;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="bg-white dark:bg-[#111] rounded-2xl border border-[#e5e5e5] dark:border-[#222] p-6 mt-2">
      <h3 className="text-[15px] font-semibold mb-1 dark:text-white">Default Model</h3>
      <p className="text-[13px] text-[#999] mb-4">
        Choose the AI model used for chat, summaries, and quizzes.
      </p>

      {loadingModels ? (
        <div className="flex items-center gap-2 text-[13px] text-[#999]">
          <Loader2 size={14} className="animate-spin" /> Loading models...
        </div>
      ) : models.length === 0 ? (
        <p className="text-[13px] text-[#999]">
          Connect a provider above to see available models.
        </p>
      ) : (
        <div className="flex items-center gap-3">
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#141414] dark:text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
          >
            {Object.entries(groupedModels).map(([groupName, groupModels]) => (
              <optgroup key={groupName} label={groupName}>
                {groupModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {saving && <Loader2 size={14} className="animate-spin text-[#999]" />}
        </div>
      )}
    </div>
  );
}

// ── Provider Card ────────────────────────────────────────────

function ProviderCard({
  provider,
  status,
  activeFlow,
  setActiveFlow,
  onStatusChange,
}: {
  provider: (typeof PROVIDERS)[number];
  status?: ProviderStatus;
  activeFlow: string | null;
  setActiveFlow: (f: string | null) => void;
  onStatusChange: () => void;
}) {
  const [disconnecting, setDisconnecting] = useState(false);
  const isConnected = status?.connected ?? false;

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/auth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider.id }),
      });
      onStatusChange();
    } catch {
      // handle error
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-[#111] rounded-2xl border ${isConnected ? "border-green-200 dark:border-green-900" : "border-[#e5e5e5] dark:border-[#222]"} p-6 transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl ${provider.bg} flex items-center justify-center shrink-0`}>
            <provider.icon size={20} className={provider.color} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold dark:text-white">{provider.name}</h3>
              {isConnected ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#999] bg-[#f5f5f5] dark:bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                  <XCircle size={10} /> Not connected
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#666] dark:text-[#888] mt-0.5">{provider.description}</p>
            {isConnected && status?.email && (
              <p className="text-[12px] text-[#999] mt-1.5">
                Signed in as <span className="font-medium text-[#666] dark:text-[#aaa]">{status.email}</span>
                {status.updatedAt && (
                  <> · Last refreshed {new Date(status.updatedAt).toLocaleDateString()}</>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900 text-[12px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              {disconnecting ? <Loader2 size={12} className="animate-spin" /> : <Unplug size={12} />}
              Disconnect
            </button>
          ) : (
            <ConnectButton
              provider={provider}
              activeFlow={activeFlow}
              setActiveFlow={setActiveFlow}
              onSuccess={onStatusChange}
            />
          )}
        </div>
      </div>

      {/* Device code modal inline */}
      {activeFlow === provider.id && provider.authType === "device-code" && (
        <DeviceCodeFlow
          onComplete={() => {
            setActiveFlow(null);
            onStatusChange();
          }}
          onCancel={() => setActiveFlow(null)}
        />
      )}

      {activeFlow === provider.id && provider.authType === "oauth" && (
        <OAuthWaiting
          providerName={provider.name}
          onCancel={() => setActiveFlow(null)}
        />
      )}
    </div>
  );
}

// ── Connect Button ───────────────────────────────────────────

function ConnectButton({
  provider,
  activeFlow,
  setActiveFlow,
  onSuccess,
}: {
  provider: (typeof PROVIDERS)[number];
  activeFlow: string | null;
  setActiveFlow: (f: string | null) => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (activeFlow) return; // Another flow is active
    setLoading(true);

    try {
      if (provider.authType === "device-code") {
        setActiveFlow(provider.id);
      } else {
        // OAuth flow — get auth URL and open it
        const res = await fetch("/api/auth/google/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: provider.id }),
        });
        const data = await res.json();
        if (data.authUrl) {
          window.open(data.authUrl, "_blank");
          setActiveFlow(provider.id);
          // Poll for completion
          pollOAuthCompletion(provider.id, onSuccess, () => setActiveFlow(null));
        }
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading || !!activeFlow}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[12px] font-medium hover:opacity-90 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
      Connect
    </button>
  );
}

// ── Poll OAuth completion ────────────────────────────────────

function pollOAuthCompletion(
  providerId: string,
  onSuccess: () => void,
  onTimeout: () => void
) {
  let attempts = 0;
  const maxAttempts = 60; // 2 minutes at 2s intervals

  const interval = setInterval(async () => {
    attempts++;
    if (attempts >= maxAttempts) {
      clearInterval(interval);
      onTimeout();
      return;
    }

    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      if (data[providerId]?.connected) {
        clearInterval(interval);
        onSuccess();
      }
    } catch {
      // Continue polling
    }
  }, 2000);
}

// ── GitHub Device Code Flow ──────────────────────────────────

function DeviceCodeFlow({
  onComplete,
  onCancel,
}: {
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"loading" | "show-code" | "polling" | "success" | "error">("loading");
  const [deviceData, setDeviceData] = useState<DeviceCodeData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startDeviceFlow();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startDeviceFlow = async () => {
    try {
      const res = await fetch("/api/auth/github-copilot/device-code", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDeviceData(data);
      setStep("show-code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start login");
      setStep("error");
    }
  };

  const startPolling = () => {
    if (!deviceData) return;
    setStep("polling");

    let interval = deviceData.interval || 5;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/github-copilot/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceCode: deviceData.deviceCode,
            interval,
          }),
        });
        const data = await res.json();

        switch (data.status) {
          case "complete":
            if (pollRef.current) clearInterval(pollRef.current);
            setEmail(data.email);
            setStep("success");
            setTimeout(onComplete, 1500);
            break;
          case "slow_down":
            interval = data.interval || interval + 5;
            break;
          case "expired":
          case "denied":
            if (pollRef.current) clearInterval(pollRef.current);
            setError(data.status === "expired" ? "Code expired" : "Access denied");
            setStep("error");
            break;
          // "pending" — continue
        }
      } catch {
        // Continue polling on network error
      }
    }, interval * 1000);
  };

  const copyCode = async () => {
    if (!deviceData) return;
    await navigator.clipboard.writeText(deviceData.userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-5 pt-5 border-t border-[#f0f0f0] dark:border-[#222]">
      {step === "loading" && (
        <div className="flex items-center gap-3 text-[13px] text-[#666] dark:text-[#888]">
          <Loader2 size={16} className="animate-spin" />
          Requesting login code from GitHub...
        </div>
      )}

      {step === "show-code" && deviceData && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center text-[13px] font-bold shrink-0 dark:text-white">1</div>
            <div>
              <p className="text-[14px] font-medium dark:text-white">Copy this code:</p>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-[20px] font-mono font-bold tracking-[0.2em] bg-[#f6f8fa] dark:bg-[#141414] border border-[#d0d7de] dark:border-[#333] rounded-xl px-5 py-2.5 dark:text-white">
                  {deviceData.userCode}
                </code>
                <button
                  onClick={copyCode}
                  className="p-2 rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-[#999]" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center text-[13px] font-bold shrink-0 dark:text-white">2</div>
            <div>
              <p className="text-[14px] font-medium dark:text-white">Paste it on GitHub:</p>
              <a
                href={deviceData.verificationUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-[#f6f8fa] dark:bg-[#141414] border border-[#d0d7de] dark:border-[#333] text-[13px] font-medium text-[#333] dark:text-[#ccc] hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] transition-colors"
              >
                <ExternalLink size={12} />
                {deviceData.verificationUri}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={startPolling}
              className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[13px] font-medium hover:opacity-90 transition-all"
            >
              I&apos;ve entered the code
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-[#e5e5e5] dark:border-[#333] text-[13px] font-medium text-[#666] dark:text-[#888] hover:bg-[#f8f8f8] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === "polling" && (
        <div className="flex items-center gap-3 text-[13px] text-[#666] dark:text-[#888]">
          <Loader2 size={16} className="animate-spin" />
          Waiting for authorization... Complete the GitHub login in your browser.
          <button onClick={onCancel} className="ml-auto text-[12px] text-[#999] hover:text-[#666] dark:hover:text-[#ccc]">
            Cancel
          </button>
        </div>
      )}

      {step === "success" && (
        <div className="flex items-center gap-3 text-[13px] text-green-600 font-medium">
          <CheckCircle2 size={16} />
          Connected{email ? ` as ${email}` : ""}! 🎉
        </div>
      )}

      {step === "error" && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[13px] text-red-500">
            <AlertCircle size={16} />
            {error}
          </div>
          <button
            onClick={() => { setStep("loading"); startDeviceFlow(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#666] dark:text-[#888] hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a]"
          >
            <RefreshCcw size={12} /> Retry
          </button>
          <button onClick={onCancel} className="text-[12px] text-[#999] hover:text-[#666] dark:hover:text-[#ccc]">Cancel</button>
        </div>
      )}
    </div>
  );
}

// ── OAuth Waiting indicator ──────────────────────────────────

function OAuthWaiting({
  providerName,
  onCancel,
}: {
  providerName: string;
  onCancel: () => void;
}) {
  return (
    <div className="mt-5 pt-5 border-t border-[#f0f0f0] dark:border-[#222]">
      <div className="flex items-center gap-3 text-[13px] text-[#666] dark:text-[#888]">
        <Loader2 size={16} className="animate-spin" />
        Waiting for {providerName} authorization... Complete the login in your browser.
        <button onClick={onCancel} className="ml-auto text-[12px] text-[#999] hover:text-[#666] dark:hover:text-[#ccc]">
          Cancel
        </button>
      </div>
    </div>
  );
}
