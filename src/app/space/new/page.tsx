"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

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
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

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
    <div className="p-4 sm:p-6 md:p-8 max-w-[680px] mx-auto text-foreground">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <h1 className="text-[24px] sm:text-[30px] font-semibold tracking-tight mb-1">Create Space</h1>
      <p className="text-muted-foreground text-[14px] sm:text-[15px] mb-6">Give this space a clear name and a simple visual marker.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-[13px]" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col gap-5">
        <div className="rounded-lg border border-border bg-background p-4 flex items-center gap-3" role="img" aria-label={`Space preview: ${name || "Untitled Space"}`}>
          <div className={`w-12 h-12 rounded-xl ${selectedColor.value} flex items-center justify-center text-xl`} aria-hidden="true">
            {selectedIcon}
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold truncate">{name || "Untitled Space"}</p>
            <p className="text-[13px] text-muted-foreground truncate">{description || "No description"}</p>
          </div>
        </div>

        <div>
          <label htmlFor="space-name" className="block text-[13px] font-medium mb-2">
            Space Name <span className="text-destructive">*</span>
          </label>
          <input
            id="space-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Biology 101"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label htmlFor="space-description" className="block text-[13px] font-medium mb-2">
            Description <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="space-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will you study in this space?"
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none placeholder:text-muted-foreground"
          />
        </div>

        <fieldset>
          <legend className="block text-[13px] font-medium mb-2">Icon</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Icon selection">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setSelectedIcon(icon)}
                role="radio"
                aria-checked={selectedIcon === icon}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${
                  selectedIcon === icon ? "bg-secondary ring-2 ring-ring/30" : "bg-background border border-border hover:bg-secondary"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="block text-[13px] font-medium mb-2">Color</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color selection">
            {COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color)}
                role="radio"
                aria-checked={selectedColor.name === color.name}
                aria-label={`Color: ${color.name}`}
                className={`w-9 h-9 rounded-lg ${color.value} ${
                  selectedColor.name === color.name ? "ring-2 ring-ring/50 ring-offset-2" : "hover:opacity-90"
                }`}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3 pt-1">
          <Link href="/dashboard" className="flex-1 py-2.5 rounded-lg border border-border text-[14px] font-medium text-center text-foreground hover:bg-secondary transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!name.trim() || creating}
            className="flex-1 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {creating ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Space"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
