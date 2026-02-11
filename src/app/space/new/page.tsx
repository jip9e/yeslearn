"use client";
import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Loader2 } from "lucide-react";

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

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    <div className="p-8 max-w-[640px] mx-auto text-gray-900 dark:text-gray-100">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white mb-6">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <h1 className="text-[28px] font-bold tracking-tight mb-1">Create New Space</h1>
      <p className="text-gray-600 dark:text-gray-400 text-[15px] mb-8">Organize your learning materials into a focused space.</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-[13px]" role="alert" aria-live="polite">{error}</div>
      )}
      <p className="sr-only" role="status" aria-live="polite">
        {creating ? "Creating space" : ""}
      </p>

      <form onSubmit={handleCreate} className="flex flex-col gap-6">
        {/* Preview */}
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-6 flex items-center gap-4" role="img" aria-label={`Space preview: ${name || "Untitled Space"} with ${selectedIcon} icon`}>
          <div className={`w-14 h-14 rounded-2xl ${selectedColor.value} flex items-center justify-center text-2xl`} aria-hidden="true">
            {selectedIcon}
          </div>
          <div>
            <p className="text-[16px] font-semibold">{name || "Untitled Space"}</p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">{description || "No description"}</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="space-name" className="block text-[13px] font-medium mb-2">
            Space Name <span className="text-red-600" aria-label="required">*</span>
          </label>
          <input
            id="space-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Biology 101, Machine Learning, History"
            required
            aria-required="true"
            aria-describedby={error && !name.trim() ? "name-error" : undefined}
            aria-invalid={error && !name.trim() ? "true" : "false"}
            className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111] text-[14px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 focus:border-[#ccc] dark:focus:border-[#3a3a3a] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white placeholder:text-[#aaa] dark:placeholder:text-[#666]"
          />
          {error && !name.trim() && (
            <p id="name-error" className="text-[12px] text-red-600 mt-1">
              Space name is required
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="space-description" className="block text-[13px] font-medium mb-2">
            Description <span className="text-gray-400 dark:text-gray-500">(optional)</span>
          </label>
          <textarea
            id="space-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will you study in this space?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black resize-none placeholder:text-[#ccc]"
          />
        </div>

        {/* Icon */}
        <div>
          <fieldset>
            <legend className="block text-[13px] font-medium mb-2">Icon</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Icon selection">
              {ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  role="radio"
                  aria-checked={selectedIcon === icon}
                  aria-label={`Icon: ${icon}`}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black ${selectedIcon === icon
                      ? "bg-[#f1f1f1] dark:bg-[#1f1f1f] ring-2 ring-black/20 dark:ring-white/20 scale-110"
                      : "bg-white dark:bg-[#111] border border-[#e5e5e5] dark:border-[#2a2a2a] hover:bg-[#f8f8f8] dark:hover:bg-[#1a1a1a]"
                    }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Color */}
        <div>
          <fieldset>
            <legend className="block text-[13px] font-medium mb-2">Color</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color selection">
              {COLORS.map((color) => (
                <button
                  type="button"
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  role="radio"
                  aria-checked={selectedColor.name === color.name}
                  aria-label={`Color: ${color.name}`}
                  className={`w-10 h-10 rounded-lg ${color.value} transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black ${selectedColor.name === color.name
                      ? "ring-2 ring-black/30 ring-offset-2 scale-110"
                      : "hover:scale-105"
                    }`}
                />
              ))}
            </div>
          </fieldset>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tag-input" className="block text-[13px] font-medium mb-2">
            Tags <span className="text-gray-400 dark:text-gray-500">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f1f1f1] dark:bg-[#1f1f1f] text-[12px] font-medium text-gray-800 dark:text-gray-200"
              >
                {tag}
                <button 
                  type="button"
                  onClick={() => removeTag(tag)} 
                  aria-label={`Remove tag: ${tag}`}
                  className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black dark:focus-visible:ring-white rounded"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              id="tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              aria-describedby="tag-help"
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111] text-[13px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 focus:border-[#ccc] dark:focus:border-[#3a3a3a] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white placeholder:text-[#aaa] dark:placeholder:text-[#666]"
            />
            <button
              type="button"
              onClick={addTag}
              aria-label="Add tag"
              className="px-4 py-2.5 rounded-xl bg-[#f1f1f1] dark:bg-[#1f1f1f] text-[13px] font-medium text-gray-900 dark:text-gray-100 hover:bg-[#e5e5e5] dark:hover:bg-[#2a2a2a] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
            >
              Add
            </button>
          </div>
          <p id="tag-help" className="sr-only">Press Enter to add a tag</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex-1 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] text-[14px] font-medium text-center text-gray-900 dark:text-gray-100 hover:bg-[#f8f8f8] dark:hover:bg-[#1a1a1a] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!name.trim() || creating}
            aria-disabled={!name.trim() || creating}
            aria-label={creating ? "Creating space..." : "Create new space"}
            className="flex-1 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[14px] font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            {creating ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                Creating...
              </span>
            ) : "Create Space"}
          </button>
        </div>
      </form>
    </div>
  );
}
