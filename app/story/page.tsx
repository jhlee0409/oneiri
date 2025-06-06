import DreamStoryDisplay from "../components/dream-story-display"

// Sample data - in a real app, this would come from your API/database
const sampleStoryData = {
  title: "The Enchanted Forest of Whispered Secrets",
  story: `In the heart of an ancient forest where moonbeams danced through emerald leaves, you found yourself walking along a path made of starlight. The air shimmered with magic, and every step you took created ripples of silver light that spread outward like gentle waves.

As you ventured deeper, the trees began to whisper secrets in a language you somehow understood. They spoke of forgotten dreams and lost memories, their voices like wind chimes in a gentle breeze. A mysterious stranger appeared from behind a massive oak tree, their face obscured by shadows but their presence radiating warmth and familiarity.

The stranger extended their hand, and when you took it, the entire forest transformed. Flowers bloomed in fast-forward, their petals glowing with an inner light. You felt yourself lifting off the ground, not quite flying but floating, as if the very air supported your dreams.

Together, you and the stranger danced among the treetops, spinning through clouds of golden dust that tasted like childhood laughter. The forest below stretched endlessly, a tapestry of green and gold that pulsed with life. In this moment, you understood that some journeys are meant to be felt rather than remembered, and some companions are meant to guide us through the landscapes of our sleeping minds.

As dawn approached in your dream, the stranger smiled and began to fade like morning mist. But their final words echoed in your heart: "Every dream is a doorway, and every dreamer holds the key."`,
  originalDream: `I was in a forest and there was someone mysterious there. We were flying or floating somehow. The trees were talking and everything felt magical. There were bright lights and it felt really peaceful and meaningful.`,
  keywords: ["forest", "flying", "mysterious stranger"],
  emotion: "😊",
  vibe: "Mystical",
}

export default function StoryPage() {
  return <DreamStoryDisplay storyData={sampleStoryData} />
}
