/**
 * Feature Flags Configuration
 * Controls which backend (Supabase vs NestJS) to use for each module
 */

export interface FeatureFlags {
  // Global toggle - set to true to use NestJS backend, false to use Supabase
  useNestJSBackend: boolean;

  // Per-module toggles (overrides global if set)
  modules: {
    auth: boolean | null;
    finance: boolean | null;
    teamPayments: boolean | null;
    storage: boolean | null;
    calendar: boolean | null;
    projects: boolean | null;
    clients: boolean | null;
    teamMembers: boolean | null;
    packages: boolean | null;
    addOns: boolean | null;
    leads: boolean | null;
    galleries: boolean | null;
    profile: boolean | null;
    clientFeedback: boolean | null;
    profileSettings: boolean | null;
  };
}

/**
 * Get feature flags from environment
 */
function getEnvFeatureFlags(): FeatureFlags {
  const envValue = import.meta.env.VITE_USE_NESTJS_API;
  const globalToggle = envValue === 'true' || envValue === '1';

  return {
    useNestJSBackend: globalToggle,
    modules: {
      auth: parseModuleEnv('VITE_NESTJS_AUTH'),
      finance: parseModuleEnv('VITE_NESTJS_FINANCE'),
      teamPayments: parseModuleEnv('VITE_NESTJS_TEAM_PAYMENTS'),
      storage: parseModuleEnv('VITE_NESTJS_STORAGE'),
      calendar: parseModuleEnv('VITE_NESTJS_CALENDAR'),
      projects: parseModuleEnv('VITE_NESTJS_PROJECTS'),
      clients: parseModuleEnv('VITE_NESTJS_CLIENTS'),
      teamMembers: parseModuleEnv('VITE_NESTJS_TEAM_MEMBERS'),
      packages: parseModuleEnv('VITE_NESTJS_PACKAGES'),
      addOns: parseModuleEnv('VITE_NESTJS_ADDONS'),
      leads: parseModuleEnv('VITE_NESTJS_LEADS'),
      galleries: parseModuleEnv('VITE_NESTJS_GALLERIES'),
      profile: parseModuleEnv('VITE_NESTJS_PROFILE'),
      clientFeedback: parseModuleEnv('VITE_NESTJS_CLIENT_FEEDBACK'),
      profileSettings: parseModuleEnv('VITE_NESTJS_PROFILE_SETTINGS'),
    },
  };
}

function parseModuleEnv(key: string): boolean | null {
  const value = import.meta.env[key];
  if (value === undefined || value === null || value === '') return null;
  return value === 'true' || value === '1';
}

// Singleton instance
let featureFlagsInstance: FeatureFlags | null = null;

/**
 * Get feature flags (singleton)
 */
export function getFeatureFlags(): FeatureFlags {
  if (!featureFlagsInstance) {
    featureFlagsInstance = getEnvFeatureFlags();
  }
  return featureFlagsInstance;
}

/**
 * Check if a module should use NestJS backend
 */
export function useNestJSForModule(
  moduleName: keyof FeatureFlags['modules']
): boolean {
  const flags = getFeatureFlags();

  // Check module-specific flag first
  const moduleFlag = flags.modules[moduleName];
  if (moduleFlag !== null) {
    return moduleFlag;
  }

  // Fall back to global flag
  return flags.useNestJSBackend;
}

/**
 * Override feature flags (for testing or runtime config)
 */
export function setFeatureFlags(flags: Partial<FeatureFlags>): void {
  featureFlagsInstance = {
    ...getFeatureFlags(),
    ...flags,
    modules: {
      ...getFeatureFlags().modules,
      ...(flags.modules || {}),
    },
  };
}

/**
 * Reset feature flags to environment defaults
 */
export function resetFeatureFlags(): void {
  featureFlagsInstance = null;
}

/**
 * Log current feature flags (for debugging)
 */
export function logFeatureFlags(): void {
  const flags = getFeatureFlags();
  console.group('🚩 Feature Flags');
  console.log('Global:', flags.useNestJSBackend ? 'NestJS' : 'Supabase');
  console.log('Modules:');
  Object.entries(flags.modules).forEach(([module, value]) => {
    const status =
      value === null
        ? `↪️ (using global: ${flags.useNestJSBackend ? 'NestJS' : 'Supabase'})`
        : value
        ? '✅ NestJS'
        : '❌ Supabase';
    console.log(`  ${module}: ${status}`);
  });
  console.groupEnd();
}

// Log feature flags on startup in development
if (import.meta.env.DEV) {
  logFeatureFlags();
}
