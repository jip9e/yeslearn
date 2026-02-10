import fs from "fs";
import path from "path";
import os from "os";
import { getDataDir } from "@/lib/db";
import type { AuthProfile, ProfileStore, ProviderName } from "./types";

// ── File path ────────────────────────────────────────────────

function getStorePath(): string {
    return path.join(getDataDir(), "auth-profiles.json");
}

// ── Default empty store ──────────────────────────────────────

function emptyStore(): ProfileStore {
    return {
        profiles: {},
        order: {
            "github-copilot": [],
            "google-gemini-cli": [],
            "google-antigravity": [],
        },
    };
}

// ── Read ─────────────────────────────────────────────────────

export function readStore(): ProfileStore {
    const p = getStorePath();
    try {
        if (!fs.existsSync(p)) return emptyStore();
        const raw = fs.readFileSync(p, "utf-8");
        const data = JSON.parse(raw) as ProfileStore;
        // Ensure order keys exist
        if (!data.order) data.order = emptyStore().order;
        for (const prov of ["github-copilot", "google-gemini-cli", "google-antigravity"] as ProviderName[]) {
            if (!data.order[prov]) data.order[prov] = [];
        }
        if (!data.profiles) data.profiles = {};
        return data;
    } catch {
        return emptyStore();
    }
}

// ── Write (atomic: temp → rename) ────────────────────────────

export function writeStore(store: ProfileStore): void {
    const p = getStorePath();
    const tmp = p + ".tmp";
    const json = JSON.stringify(store, null, 2);

    fs.writeFileSync(tmp, json, { encoding: "utf-8", mode: 0o600 });

    // Atomic rename
    fs.renameSync(tmp, p);

    // Restrict permissions on the final file (Windows is best-effort)
    try {
        if (os.platform() !== "win32") {
            fs.chmodSync(p, 0o600);
        }
    } catch {
        // Best-effort
    }
}

// ── Profile CRUD ─────────────────────────────────────────────

export function getProfile(profileId: string): AuthProfile | undefined {
    const store = readStore();
    return store.profiles[profileId];
}

export function setProfile(profileId: string, profile: AuthProfile): void {
    const store = readStore();
    const isNew = !store.profiles[profileId];

    store.profiles[profileId] = profile;

    // Add to order if new
    if (isNew) {
        const provider = profile.provider;
        if (!store.order[provider]) store.order[provider] = [];
        if (!store.order[provider].includes(profileId)) {
            store.order[provider].push(profileId);
        }
    }

    writeStore(store);
}

export function deleteProfile(profileId: string): boolean {
    const store = readStore();
    const profile = store.profiles[profileId];
    if (!profile) return false;

    delete store.profiles[profileId];

    // Remove from order
    const provider = profile.provider;
    if (store.order[provider]) {
        store.order[provider] = store.order[provider].filter((id) => id !== profileId);
    }

    writeStore(store);
    return true;
}

export function listProfiles(provider: ProviderName): AuthProfile[] {
    const store = readStore();
    const ids = store.order[provider] || [];
    return ids.map((id) => store.profiles[id]).filter(Boolean);
}

export function getDefaultProfileId(provider: ProviderName): string {
    return `${provider}:main`;
}

export function getDefaultProfile(provider: ProviderName): AuthProfile | undefined {
    return getProfile(getDefaultProfileId(provider));
}
