import { EMOTION_OPTIONS, GENRE_OPTIONS, MOOD_OPTIONS } from "./constants";

export const findEmotion = (dreamEmotion: string) => {
  return EMOTION_OPTIONS.find(
    (emotion) =>
      emotion.value === dreamEmotion || emotion.emoji === dreamEmotion
  );
};

export const findMood = (dreamMood: string) => {
  return MOOD_OPTIONS.find((mood) => mood.value === dreamMood);
};

export const findGenre = (dreamGenre: string) => {
  return GENRE_OPTIONS.find((genre) => genre.value === dreamGenre);
};
