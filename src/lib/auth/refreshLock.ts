// ── Per-profile refresh lock ─────────────────────────────────
// Prevents concurrent token refresh races that could clobber tokens.
// In-memory Map keyed by profile ID; only one refresh runs at a time per profile.

const locks = new Map<string, Promise<void>>();

export async function withProfileLock<T>(
    profileId: string,
    fn: () => Promise<T>
): Promise<T> {
    // If another refresh is in-flight for this profile, wait for it first
    while (locks.has(profileId)) {
        try {
            await locks.get(profileId);
        } catch {
            // Previous holder errored — we continue and try ourselves
        }
    }

    let resolve!: () => void;
    let reject!: (err: unknown) => void;

    const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    locks.set(profileId, promise);

    try {
        const result = await fn();
        resolve();
        return result;
    } catch (err) {
        reject(err);
        throw err;
    } finally {
        locks.delete(profileId);
    }
}
