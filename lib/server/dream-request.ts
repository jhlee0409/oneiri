import type { DreamStoryInput } from "@/lib/server/dream-story";

export interface DreamRequestData extends DreamStoryInput {
  storyPreferenceLength?: string;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * 꿈 생성 요청 본문(snake_case/camelCase 모두 허용)을 해석한다.
 * 꿈 내용이 5글자 미만이면 null.
 */
export function parseDreamRequest(rawData: Record<string, unknown>): DreamRequestData | null {
  const dreamInputText = str(rawData.dreamInputText) || str(rawData.dream_input_text);
  if (!dreamInputText || dreamInputText.trim().length < 5) return null;

  const keywords = rawData.dreamKeywords || rawData.dream_keywords;
  return {
    dreamInputText: dreamInputText.trim(),
    dreamKeywords: Array.isArray(keywords)
      ? keywords.filter((k): k is string => typeof k === "string")
      : undefined,
    dreamEmotion: str(rawData.dreamEmotion) || str(rawData.dream_emotion),
    storyPreferenceGenre:
      str(rawData.storyPreferenceGenre) || str(rawData.story_preference_genre),
    storyPreferenceLength:
      str(rawData.storyPreferenceLength) || str(rawData.story_preference_length),
    storyPreferenceMood:
      str(rawData.storyPreferenceMood) || str(rawData.story_preference_mood),
    dreamCharacters: str(rawData.dreamCharacters) || str(rawData.dream_characters),
    dreamObjects: str(rawData.dreamObjects) || str(rawData.dream_objects),
  };
}
