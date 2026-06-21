export interface InstagramPlan {
  translatedConcept: string;
  conceptEmotion: string;
  strategy: {
    bestFormat: string;
    formatReasoning: string;
    coreAngle: string;
  };
  hooks: {
    curiosityHook: string;
    visualActionHook: string;
    relatableHook: string;
  };
  contentArc: {
    zeroToThreeSeconds: string;
    threeToFifteenSeconds: string;
    fifteenPlusSeconds: string;
    cta: string;
  };
  seoCaption: {
    firstLine: string;
    body: string;
    hashtags: string[];
  };
}

export interface SavedPlan {
  id: string;
  timestamp: string;
  idea: string;
  vibe: string;
  plan: InstagramPlan;
  isFavorite?: boolean;
}
