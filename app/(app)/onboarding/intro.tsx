import { useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, type ViewToken } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../../components/ui/Screen';
import { PrimaryBtn } from '../../../components/ui/PrimaryBtn';
import { colors } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'The hardest part',
    body: 'Most focus apps fail because they ignore the hardest part: the moment before you start.',
  },
  {
    title: 'Less is more',
    body: '1–2 deep sessions a day is all it takes.',
  },
  {
    title: 'Protection, not productivity',
    body: "This isn't productivity. It's protection.",
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  function handleNext() {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      router.push('/(app)/onboarding/customize');
    }
  }

  function handleSkip() {
    router.push('/(app)/onboarding/customize');
  }

  return (
    <Screen>
      <View style={s.container}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={s.slide}>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.body}>{item.body}</Text>
            </View>
          )}
        />

        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, i === activeIndex && s.dotActive]} />
          ))}
        </View>

        <View style={s.buttons}>
          <PrimaryBtn
            label={activeIndex === SLIDES.length - 1 ? "I'm ready" : 'Next'}
            onPress={handleNext}
          />
          {activeIndex < SLIDES.length - 1 && (
            <Text style={s.skip} onPress={handleSkip}>
              Skip
            </Text>
          )}
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingBottom: 40 },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
  },
  body: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '300',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 24,
  },
  buttons: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  skip: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
