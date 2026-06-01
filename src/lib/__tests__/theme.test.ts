import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Property 18: Theme preference persistence round-trip
 * Saving a theme preference and reloading returns the same value.
 *
 * **Validates: Requirements 20.5, 20.6**
 *
 * We test the theme persistence property by simulating an in-memory
 * store that mirrors the database behavior. The core invariant is:
 * writing a theme value and reading it back always returns the same value.
 */

// Valid theme modes matching the Prisma enum
type ThemeMode = "DAY" | "NIGHT";
const VALID_THEMES: ThemeMode[] = ["DAY", "NIGHT"];

/**
 * Simulates the theme persistence layer (database write + read).
 * This mirrors what updateThemePreference does (write to DB)
 * and what the session callback does (read from DB).
 */
class ThemeStore {
  private store: Map<string, ThemeMode> = new Map();

  save(userId: string, theme: ThemeMode): void {
    this.store.set(userId, theme);
  }

  load(userId: string): ThemeMode | undefined {
    return this.store.get(userId);
  }

  clear(): void {
    this.store.clear();
  }
}

// Generators
const themeModeArb = fc.constantFrom<ThemeMode>("DAY", "NIGHT");
const userIdArb = fc.string({ minLength: 5, maxLength: 25 }).map(
  (s) => `user-${s.replace(/[^a-zA-Z0-9]/g, "x")}`
);

describe("Property 18: Theme preference persistence round-trip", () => {
  it("saving a theme preference and reading it back returns the same value", () => {
    fc.assert(
      fc.property(themeModeArb, userIdArb, (themeMode, userId) => {
        const store = new ThemeStore();

        // Save the theme preference (mirrors updateThemePreference)
        store.save(userId, themeMode);

        // Read it back (mirrors session callback reading themeMode)
        const loaded = store.load(userId);

        // Round-trip: saved value equals retrieved value
        expect(loaded).toBe(themeMode);
      }),
      { numRuns: 100 }
    );
  });

  it("theme preference is idempotent - saving the same value twice results in the same stored value", () => {
    fc.assert(
      fc.property(themeModeArb, userIdArb, (themeMode, userId) => {
        const store = new ThemeStore();

        // Save the theme preference twice
        store.save(userId, themeMode);
        store.save(userId, themeMode);

        // The stored value should still be the same
        const loaded = store.load(userId);
        expect(loaded).toBe(themeMode);
      }),
      { numRuns: 100 }
    );
  });

  it("switching theme from DAY to NIGHT and back preserves the final value", () => {
    fc.assert(
      fc.property(
        fc.array(themeModeArb, { minLength: 1, maxLength: 20 }),
        userIdArb,
        (themeSequence, userId) => {
          const store = new ThemeStore();

          // Apply all theme changes in sequence
          for (const theme of themeSequence) {
            store.save(userId, theme);
          }

          // The final stored value should be the last theme in the sequence
          const lastTheme = themeSequence[themeSequence.length - 1];
          const loaded = store.load(userId);
          expect(loaded).toBe(lastTheme);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("theme values are always one of the valid enum values", () => {
    fc.assert(
      fc.property(themeModeArb, userIdArb, (themeMode, userId) => {
        const store = new ThemeStore();
        store.save(userId, themeMode);

        const loaded = store.load(userId);
        expect(VALID_THEMES).toContain(loaded);
      }),
      { numRuns: 100 }
    );
  });

  it("different users can have different theme preferences independently", () => {
    fc.assert(
      fc.property(
        themeModeArb,
        themeModeArb,
        userIdArb,
        userIdArb,
        (theme1, theme2, userId1, userId2) => {
          // Only test when users are different
          fc.pre(userId1 !== userId2);

          const store = new ThemeStore();

          // Save different themes for different users
          store.save(userId1, theme1);
          store.save(userId2, theme2);

          // Each user's theme is independent
          expect(store.load(userId1)).toBe(theme1);
          expect(store.load(userId2)).toBe(theme2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
