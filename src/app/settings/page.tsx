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
  Gem,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Provider metadata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PROVIDERS = [
  {
    id: "github-copilot" as const,
    name: "GitHub Copilot",
    description: "Access GPT-4o, GPT-4.1, Claude Sonnet 4 and more via your Copilot subscription",
    icon: Github,
    color: "text-foreground",
    bg: "bg-secondary",
    border: "border-border",
    authType: "device-code" as const,
  },
  {
    id: "google-gemini-cli" as const,
    name: "Google Gemini",
    description: "Access Gemini 2.5 Pro, Gemini 2.5 Flash via Google Cloud",
    icon: Gem,
    color: "text-foreground",
    bg: "bg-secondary",
    border: "border-border",
    authType: "oauth" as const,
  },
  {
    id: "google-antigravity" as const,
    name: "Google Antigravity",
    description: "Access Claude, Gemini and more via Google Antigravity platform",
    icon: Globe2,
    color: "text-foreground",
    bg: "bg-secondary",
    border: "border-border",
    authType: "oauth" as const,
  },
];

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  const settingsTabListRef = React.useRef<HTMLElement>(null);

  const handleSettingsTabKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const tablist = settingsTabListRef.current;
    if (!tablist) return;
    const tabEls = Array.from(tablist.querySelectorAll<HTMLElement>("[role='tab']"));
    if (tabEls.length === 0) return;
    const currentIndex = tabEls.findIndex((t) => t === document.activeElement);
    if (currentIndex < 0) return;
    const focusAndActivate = (i: number) => { tabEls[i]?.focus(); tabEls[i]?.click(); };
    if (e.key === "ArrowDown") { e.preventDefault(); focusAndActivate((currentIndex + 1) % tabEls.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); focusAndActivate((currentIndex - 1 + tabEls.length) % tabEls.length); }
    else if (e.key === "Home") { e.preventDefault(); focusAndActivate(0); }
    else if (e.key === "End") { e.preventDefault(); focusAndActivate(tabEls.length - 1); }
  };

  const tabs = [
    { id: "ai-providers", label: "AI Providers", icon: Cpu },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Data & Privacy", icon: Shield },
  ];

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <h1 className="text-[28px] font-bold tracking-tight mb-1 text-foreground">Settings</h1>
      <p className="text-muted-foreground text-[15px] mb-8">Manage your AI providers and app preferences.</p>

      <div className="flex gap-8">
        {/* Settings Sidebar */}
        <div className="w-[200px] shrink-0">
          <nav ref={settingsTabListRef} className="flex flex-col gap-1" role="tablist" aria-label="Settings sections" aria-orientation="vertical" onKeyDown={handleSettingsTabKeyDown}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white ${activeTab === tab.id
                  ? "bg-background dark:bg-card border border-border text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <tab.icon size={16} aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {/* AI Providers Tab */}
          {activeTab === "ai-providers" && <div role="tabpanel" id="ai-providers-panel" aria-labelledby="ai-providers-tab"><AIProvidersTab /></div>}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="bg-card rounded-2xl border border-border p-6" role="tabpanel" id="appearance-panel">
              <h2 className="text-[16px] font-semibold mb-6 text-foreground">Appearance</h2>
              <div>
                <fieldset>
                  <legend className="block text-[13px] font-medium mb-3 text-muted-foreground">Theme</legend>
                  <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme selection">
                    {[
                      { id: "light", label: "Light", preview: "bg-background border-border" },
                      { id: "dark", label: "Dark", preview: "bg-card border-border" },
                      { id: "auto", label: "System", preview: "bg-gradient-to-r from-background to-card border-border" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleThemeChange(t.id)}
                        role="radio"
                        aria-checked={theme === t.id}
                        aria-label={`${t.label} theme`}
                        className={`p-4 rounded-xl border-2 text-center transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white ${theme === t.id ? "border-primary" : "border-border hover:border-border/80"
                          }`}
                      >
                        <div className={`w-full h-16 rounded-lg border mb-2 ${t.preview}`} aria-hidden="true" />
                        <p className="text-[13px] font-medium text-muted-foreground">{t.label}</p>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-4" role="tabpanel" id="privacy-panel">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-[16px] font-semibold mb-2 text-foreground">Data Storage</h2>
                <p className="text-[13px] text-muted-foreground/80 mb-4">
                  All your data is stored locally on your computer in %APPDATA%/.YesLearn/
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary">
                    <div>
                      <p className="text-[14px] font-medium text-foreground">Database</p>
                      <p className="text-[12px] text-muted-foreground/80">SQLite database with all your spaces and content</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary">
                    <div>
                      <p className="text-[14px] font-medium text-foreground">Auth Credentials</p>
                      <p className="text-[12px] text-muted-foreground/80">AI provider tokens stored locally with restricted permissions</p>
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

// â”€â”€ AI Providers Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
            <div className="h-5 bg-secondary rounded w-40 mb-2" />
            <div className="h-4 bg-secondary rounded w-64" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-[16px] font-semibold text-foreground">AI Providers</h2>
        <p className="text-[13px] text-muted-foreground/80 mt-1">
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

// â”€â”€ Model Selector â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    <div className="bg-card rounded-2xl border border-border p-6 mt-2">
      <h3 className="text-[15px] font-semibold mb-1 text-foreground">Default Model</h3>
      <p className="text-[13px] text-muted-foreground/80 mb-4" id="default-model-help">
        Choose the AI model used for chat, summaries, and quizzes.
      </p>

      {loadingModels ? (
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground/80" role="status">
          <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Loading models...
        </div>
      ) : models.length === 0 ? (
        <p className="text-[13px] text-muted-foreground/80">
          Connect a provider above to see available models.
        </p>
      ) : (
        <div className="flex items-center gap-3">
          <label htmlFor="default-model-select" className="sr-only">Default AI model</label>
          <select
            id="default-model-select"
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            aria-describedby="default-model-help"
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background dark:bg-card text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
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
          {saving && <Loader2 size={14} className="animate-spin text-muted-foreground/80" aria-label="Saving selection" />}
          <span className="sr-only" role="status" aria-live="polite">{saving ? "Saving default model" : ""}</span>
        </div>
      )}
    </div>
  );
}

// â”€â”€ Provider Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    <div className={`bg-card rounded-2xl border ${isConnected ? "border-green-200 dark:border-green-900" : "border-border"} p-6 transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl ${provider.bg} flex items-center justify-center shrink-0`}>
            <provider.icon size={20} className={provider.color} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-foreground">{provider.name}</h3>
              {isConnected ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80 bg-secondary px-2 py-0.5 rounded-full">
                  <XCircle size={10} /> Not connected
                </span>
              )}
            </div>
            <p className="text-[13px] text-muted-foreground mt-0.5">{provider.description}</p>
            {isConnected && status?.email && (
              <p className="text-[12px] text-muted-foreground/80 mt-1.5">
                Signed in as <span className="font-medium text-muted-foreground">{status.email}</span>
                {status.updatedAt && (
                  <> Â· Last refreshed {new Date(status.updatedAt).toLocaleDateString()}</>
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
              aria-disabled={disconnecting}
              aria-label={`Disconnect from ${provider.name}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900 text-[12px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
            >
              {disconnecting ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <Unplug size={12} aria-hidden="true" />}
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

// â”€â”€ Connect Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        // OAuth flow â€” get auth URL and open it
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
      aria-disabled={loading || !!activeFlow}
      aria-label={`Connect to ${provider.name}`}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90 transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
    >
      {loading ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <ExternalLink size={12} aria-hidden="true" />}
      Connect
    </button>
  );
}

// â”€â”€ Poll OAuth completion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ GitHub Device Code Flow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          // "pending" â€” continue
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
    <div className="mt-5 pt-5 border-t border-border">
      {step === "loading" && (
        <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Requesting login code from GitHub...
        </div>
      )}

      {step === "show-code" && deviceData && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-[13px] font-bold shrink-0 text-foreground">1</div>
            <div>
              <p className="text-[14px] font-medium text-foreground">Copy this code:</p>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-[20px] font-mono font-bold tracking-[0.2em] bg-secondary border border-border rounded-xl px-5 py-2.5 text-foreground">
                  {deviceData.userCode}
                </code>
                <button
                  onClick={copyCode}
                  aria-label={copied ? "Code copied" : "Copy code to clipboard"}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
                  title="Copy code"
                >
                  {copied ? <Check size={16} className="text-green-500" aria-hidden="true" /> : <Copy size={16} className="text-muted-foreground/80" aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-[13px] font-bold shrink-0 text-foreground">2</div>
            <div>
              <p className="text-[14px] font-medium text-foreground">Paste it on GitHub:</p>
              <a
                href={deviceData.verificationUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-secondary border border-border text-[13px] font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <ExternalLink size={12} />
                {deviceData.verificationUri}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={startPolling}
              aria-label="Confirm code entry and start polling"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
            >
              I&apos;ve entered the code
            </button>
            <button
              onClick={onCancel}
              aria-label="Cancel authentication"
              className="px-4 py-2.5 rounded-xl border border-border text-[13px] font-medium text-muted-foreground hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === "polling" && (
        <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Waiting for authorization... Complete the GitHub login in your browser.
          <button 
            onClick={onCancel} 
            aria-label="Cancel authentication"
            className="ml-auto text-[12px] text-muted-foreground/80 hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white rounded"
          >
            Cancel
          </button>
        </div>
      )}

      {step === "success" && (
        <div className="flex items-center gap-3 text-[13px] text-green-600 font-medium">
          <CheckCircle2 size={16} />
          Connected{email ? ` as ${email}` : ""}! ðŸŽ‰
        </div>
      )}

      {step === "error" && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[13px] text-red-500" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            {error}
          </div>
          <button
            onClick={() => { setStep("loading"); startDeviceFlow(); }}
            aria-label="Retry authentication"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-muted-foreground hover:bg-secondary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            <RefreshCcw size={12} aria-hidden="true" /> Retry
          </button>
          <button 
            onClick={onCancel} 
            aria-label="Cancel authentication"
            className="text-[12px] text-muted-foreground/80 hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// â”€â”€ OAuth Waiting indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function OAuthWaiting({
  providerName,
  onCancel,
}: {
  providerName: string;
  onCancel: () => void;
}) {
  return (
    <div className="mt-5 pt-5 border-t border-border">
      <div className="flex items-center gap-3 text-[13px] text-muted-foreground" role="status">
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        Waiting for {providerName} authorization... Complete the login in your browser.
        <button 
          onClick={onCancel} 
          aria-label="Cancel authentication"
          className="ml-auto text-[12px] text-muted-foreground/80 hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

