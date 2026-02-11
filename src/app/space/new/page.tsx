"use client";
import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Loader2 } from "lucide-react";

const COLORS = [
  { name: "Slate", value: "bg-slate-500" },
  { name: "Zinc", value: "bg-zinc-500" },
  { name: "Stone", value: "bg-stone-500" },
  { name: "Gray", value: "bg-gray-500" },
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

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

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

      if (!res.ok) throw new Error("Failed to create space");
      const space = await res.json();
      router.push(`/space/${space.id}`);
    } catch {
      setError("Failed to create space. Please try again.");
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-[640px] mx-auto text-foreground">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <h1 className="text-[28px] font-bold tracking-tight mb-1">Create New Space</h1>
      <p className="text-muted-foreground text-[15px] mb-8">Organize your learning materials into a focused space.</p>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[13px]" role="alert" aria-live="polite">{error}</div>}

      <form onSubmit={handleCreate} className="flex flex-col gap-6">
        <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4" role="img" aria-label={`Space preview: ${name || "Untitled Space"} with ${selectedIcon} icon`}>
          <div className={`w-14 h-14 rounded-2xl ${selectedColor.value} flex items-center justify-center text-2xl`} aria-hidden="true">{selectedIcon}</div>
          <div>
            <p className="text-[16px] font-semibold">{name || "Untitled Space"}</p>
            <p className="text-[13px] text-muted-foreground">{description || "No description"}</p>
          </div>
        </div>

        <div>
          <label htmlFor="space-name" className="block text-[13px] font-medium mb-2">Space Name <span className="text-red-600">*</span></label>
          <input id="space-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Biology 101" required className="w-full px-4 py-3 rounded-xl border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/70" />
        </div>

        <div>
          <label htmlFor="space-description" className="block text-[13px] font-medium mb-2">Description <span className="text-muted-foreground/80">(optional)</span></label>
          <textarea id="space-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will you study in this space?" rows={3} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none placeholder:text-muted-foreground/70" />
        </div>

        <div>
          <fieldset>
            <legend className="block text-[13px] font-medium mb-2">Icon</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Icon selection">
              {ICONS.map((icon) => (
                <button key={icon} type="button" onClick={() => setSelectedIcon(icon)} role="radio" aria-checked={selectedIcon === icon} aria-label={`Icon: ${icon}`} className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white ${selectedIcon === icon ? "bg-secondary ring-2 ring-ring/20 scale-110" : "bg-card border border-border hover:bg-secondary"}`}>
                  {icon}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div>
          <fieldset>
            <legend className="block text-[13px] font-medium mb-2">Color</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color selection">
              {COLORS.map((color) => (
                <button key={color.name} type="button" onClick={() => setSelectedColor(color)} role="radio" aria-checked={selectedColor.name === color.name} aria-label={`Color: ${color.name}`} className={`w-10 h-10 rounded-lg ${color.value} transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white ${selectedColor.name === color.name ? "ring-2 ring-ring/40 ring-offset-2" : "hover:scale-105"}`} />
              ))}
            </div>
          </fieldset>
        </div>

        <div>
          <label htmlFor="tag-input" className="block text-[13px] font-medium mb-2">Tags <span className="text-muted-foreground/80">(optional)</span></label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-[12px] font-medium text-foreground">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove tag: ${tag}`} className="text-muted-foreground hover:text-foreground rounded focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black dark:focus-visible:ring-white"><X size={12} aria-hidden="true" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input id="tag-input" type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add a tag..." className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/70" />
            <button type="button" onClick={addTag} aria-label="Add tag" className="px-4 py-2.5 rounded-xl bg-secondary text-[13px] font-medium text-foreground hover:opacity-90 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white">Add</button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/dashboard" className="flex-1 py-3 rounded-xl border border-border text-[14px] font-medium text-center text-foreground hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white">Cancel</Link>
          <button type="submit" disabled={!name.trim() || creating} aria-label={creating ? "Creating space…" : "Create new space"} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition-all disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white">
            {creating ? <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Creating...</span> : "Create Space"}
          </button>
        </div>
      </form>
    </div>
  );
}
