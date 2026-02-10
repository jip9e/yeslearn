"use client";
import React, { useState } from "react";
import Link from "next/link";
import AppSidebar from "@/components/app/sidebar";
import { User, Bell, Palette, Shield, CreditCard, Globe, LogOut, Camera, Check } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState("Alex Johnson");
  const [email, setEmail] = useState("alex@example.com");
  const [bio, setBio] = useState("Student at MIT. Passionate about biology and machine learning.");
  const [notifications, setNotifications] = useState({ email: true, push: true, weekly: false, marketing: false });
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-[900px] mx-auto">
          <h1 className="text-[28px] font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-[#666] text-[15px] mb-8">Manage your account settings and preferences.</p>

          <div className="flex gap-8">
            {/* Settings Sidebar */}
            <div className="w-[200px] shrink-0">
              <nav className="flex flex-col gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors text-left ${
                      activeTab === tab.id
                        ? "bg-white border border-[#e5e5e5] text-black shadow-sm"
                        : "text-[#666] hover:bg-white/50 hover:text-black"
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="border-t border-[#e5e5e5] mt-4 pt-4">
                <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 w-full text-left transition-colors">
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                  <h2 className="text-[16px] font-semibold mb-6">Profile Information</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center relative group cursor-pointer">
                      <span className="text-white text-xl font-bold">AJ</span>
                      <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={18} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[14px] font-medium">Profile Photo</p>
                      <p className="text-[12px] text-[#999]">Click to upload a new photo</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc]"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-2">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-2">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 pt-4 border-t border-[#f0f0f0]">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white text-[13px] font-medium hover:opacity-90 transition-all"
                    >
                      {saved ? <><Check size={14} /> Saved!</> : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                  <h2 className="text-[16px] font-semibold mb-6">Notification Preferences</h2>
                  <div className="flex flex-col gap-4">
                    {[
                      { key: "email" as const, label: "Email Notifications", desc: "Get notified about space updates and quiz results" },
                      { key: "push" as const, label: "Push Notifications", desc: "Receive push notifications in your browser" },
                      { key: "weekly" as const, label: "Weekly Digest", desc: "Summary of your learning progress every week" },
                      { key: "marketing" as const, label: "Product Updates", desc: "New features, tips, and YesLearn news" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-[#fafafa]">
                        <div>
                          <p className="text-[14px] font-medium">{item.label}</p>
                          <p className="text-[12px] text-[#999]">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                          className={`w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? "bg-black" : "bg-[#e0e0e0]"}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifications[item.key] ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                  <h2 className="text-[16px] font-semibold mb-6">Appearance</h2>
                  <div>
                    <label className="block text-[13px] font-medium mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "light", label: "Light", preview: "bg-white border-[#e5e5e5]" },
                        { id: "dark", label: "Dark", preview: "bg-[#1a1a1a] border-[#333]" },
                        { id: "auto", label: "System", preview: "bg-gradient-to-r from-white to-[#1a1a1a] border-[#e5e5e5]" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            theme === t.id ? "border-black" : "border-[#e5e5e5] hover:border-[#ccc]"
                          }`}
                        >
                          <div className={`w-full h-16 rounded-lg border mb-2 ${t.preview}`} />
                          <p className="text-[13px] font-medium">{t.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === "billing" && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                    <h2 className="text-[16px] font-semibold mb-4">Current Plan</h2>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8f8f8]">
                      <div>
                        <p className="text-[15px] font-semibold">Free Plan</p>
                        <p className="text-[12px] text-[#999]">5 spaces, 20 uploads/month</p>
                      </div>
                      <Link
                        href="/pricing"
                        className="px-4 py-2 rounded-xl bg-black text-white text-[13px] font-medium hover:opacity-90"
                      >
                        Upgrade
                      </Link>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                    <h2 className="text-[16px] font-semibold mb-4">Usage This Month</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[13px] mb-1">
                          <span>Uploads</span>
                          <span className="text-[#999]">8 / 20</span>
                        </div>
                        <div className="w-full h-2 bg-[#f1f1f1] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: "40%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[13px] mb-1">
                          <span>AI Chat Messages</span>
                          <span className="text-[#999]">142 / 500</span>
                        </div>
                        <div className="w-full h-2 bg-[#f1f1f1] rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full" style={{ width: "28%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[13px] mb-1">
                          <span>Quiz Generations</span>
                          <span className="text-[#999]">12 / 30</span>
                        </div>
                        <div className="w-full h-2 bg-[#f1f1f1] rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400 rounded-full" style={{ width: "40%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                    <h2 className="text-[16px] font-semibold mb-4">Password</h2>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-[13px] font-medium mb-2">Current Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] placeholder:text-[#ccc]" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-medium mb-2">New Password</label>
                          <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] placeholder:text-[#ccc]" />
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium mb-2">Confirm New Password</label>
                          <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] placeholder:text-[#ccc]" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button className="px-5 py-2.5 rounded-xl bg-black text-white text-[13px] font-medium hover:opacity-90">Update Password</button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                    <h2 className="text-[16px] font-semibold mb-2">Data & Privacy</h2>
                    <p className="text-[13px] text-[#999] mb-4">Manage your data and privacy preferences</p>
                    <div className="flex flex-col gap-3">
                      <button className="text-left px-4 py-3 rounded-xl hover:bg-[#f8f8f8] text-[13px] font-medium transition-colors">Export All Data</button>
                      <button className="text-left px-4 py-3 rounded-xl hover:bg-red-50 text-[13px] font-medium text-red-500 transition-colors">Delete Account</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
