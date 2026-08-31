export interface SmartAlertPreferences {
  masterEnabled: boolean;
  highRisk: boolean;
  extremeUv: boolean;
  rapidUvIncrease: boolean;
  burnWarning: boolean;
  reapplySunscreen: boolean;
}

export const DEFAULT_SMART_ALERT_PREFERENCES: SmartAlertPreferences = {
  masterEnabled: true,
  highRisk: true,
  extremeUv: true,
  rapidUvIncrease: true,
  burnWarning: true,
  reapplySunscreen: true
};

/**
 * Normalizes a stored or incoming JSON object into a fully-formed SmartAlertPreferences object.
 * Missing keys default to true. Unknown keys are ignored. Malformed values are converted to booleans.
 */
export function normalizeSmartAlertPreferences(value: any): SmartAlertPreferences {
  if (typeof value !== 'object' || value === null) {
    return { ...DEFAULT_SMART_ALERT_PREFERENCES };
  }

  const getBool = (key: string): boolean => {
    if (value.hasOwnProperty(key)) {
      // If it exists, explicitly convert it to a boolean to prevent bad types
      return Boolean(value[key]);
    }
    // Default to true if missing
    return true;
  };

  return {
    masterEnabled: getBool('masterEnabled'),
    highRisk: getBool('highRisk'),
    extremeUv: getBool('extremeUv'),
    rapidUvIncrease: getBool('rapidUvIncrease'),
    burnWarning: getBool('burnWarning'),
    reapplySunscreen: getBool('reapplySunscreen')
  };
}
