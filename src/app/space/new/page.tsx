"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";

const COLORS = [
  { name: "Blue", value: "bg-blue-400", hex: "#60a5fa" },
  { name: "Green", value: "bg-green-400", hex: "#4ade80" },
  { name: "Purple", value: "bg-purple-400", hex: "#c084fc" },
  { name: "Orange", value: "bg-orange-400", hex: "#fb923c" },
  { name: "Red", value: "bg-red-400", hex: "#f87171" },
  { name: "Teal", value: "bg-teal-400", hex: "#2dd4bf" },
  { name: "Pink", value: "bg-pink-400", hex: "#f472b6" },
  { name: "Yellow", value: "bg-yellow-400", hex: "#facc15" },
];

const ICONS = ["📚", "🧬", "🔬", "💻", "📐", "🎨", "🌍", "⚡", "🧠", "📖", "🎯", "🔢"];

export default function NewSpacePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon: selectedIcon,
          color: selectedColor.value,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create space");
      }

      const space = await res.json();
      router.push(`/space/${space.id}`);
    } catch (err) {
      setError("Failed to create space. Please try again.");
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-[640px] mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] text-[#999] hover:text-black mb-6">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <h1 className="text-[28px] font-bold tracking-tight mb-1">Create New Space</h1>
      <p className="text-[#666] text-[15px] mb-8">Organize your learning materials into a focused space.</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-[13px]">{error}</div>
      )}

      <div className="flex flex-col gap-6">
        {/* Preview */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${selectedColor.value} flex items-center justify-center text-2xl`}>
            {selectedIcon}
          </div>
          <div>
            <p className="text-[16px] font-semibold">{name || "Untitled Space"}</p>
            <p className="text-[13px] text-[#999]">{description || "No description"}</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-[13px] font-medium mb-2">Space Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Biology 101, Machine Learning, History"
            className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] placeholder:text-[#ccc]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[13px] font-medium mb-2">Description <span className="text-[#ccc]">(optional)</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will you study in this space?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] resize-none placeholder:text-[#ccc]"
          />
        </div>

        {/* Icon */}
        <div>
          <label className="block text-[13px] font-medium mb-2">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${selectedIcon === icon
                    ? "bg-[#f1f1f1] ring-2 ring-black/20 scale-110"
                    : "bg-white border border-[#e5e5e5] hover:bg-[#f8f8f8]"
                  }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-[13px] font-medium mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-lg ${color.value} transition-all ${selectedColor.name === color.name
                    ? "ring-2 ring-black/30 ring-offset-2 scale-110"
                    : "hover:scale-105"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-[13px] font-medium mb-2">Tags <span className="text-[#ccc]">(optional)</span></label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f1f1f1] text-[12px] font-medium"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="text-[#999] hover:text-black">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#e5e5e5] bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] placeholder:text-[#ccc]"
            />
            <button
              onClick={addTag}
              className="px-4 py-2.5 rounded-xl bg-[#f1f1f1] text-[13px] font-medium hover:bg-[#e5e5e5] transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex-1 py-3 rounded-xl border border-[#e5e5e5] text-[14px] font-medium text-center hover:bg-[#f8f8f8] transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="flex-1 py-3 rounded-xl bg-black text-white text-[14px] font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Space"}
          </button>
        </div>
      </div>
    </div>
  );
}
