import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const NUM_BARS = 16;
const BAR_HEIGHTS = [0.3, 0.6, 0.8, 0.5, 0.9, 0.4, 0.7, 1.0, 0.6, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4];

export default function AudioVisualizer({ isPlaying, color = '#c665e8', height = 60 }) {
  const anims = useRef(BAR_HEIGHTS.map((h) => new Animated.Value(h * 0.2))).current;
  const loops = useRef([]);

  const startAnimations = () => {
    loops.current.forEach((l) => l?.stop());
    loops.current = anims.map((anim, i) => {
      const targetH = BAR_HEIGHTS[i];
      const duration = 300 + (i % 5) * 120;
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: targetH * (0.5 + Math.random() * 0.5),
            duration,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: targetH * 0.1 + Math.random() * 0.2,
            duration,
            useNativeDriver: false,
          }),
        ])
      );
      loop.start();
      return loop;
    });
  };

  const stopAnimations = () => {
    loops.current.forEach((l) => l?.stop());
    anims.forEach((anim) => {
      Animated.timing(anim, {
        toValue: 0.05,
        duration: 400,
        useNativeDriver: false,
      }).start();
    });
  };

  useEffect(() => {
    if (isPlaying) {
      startAnimations();
    } else {
      stopAnimations();
    }
    return () => {
      loops.current.forEach((l) => l?.stop());
    };
  }, [isPlaying]);

  return (
    <View style={[styles.container, { height }]}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              opacity: 0.6 + i % 3 * 0.1,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [2, height],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 4,
  },
  bar: {
    width: 4,
    borderRadius: 3,
    minHeight: 2,
  },
});
