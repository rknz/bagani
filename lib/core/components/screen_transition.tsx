/**
 * BAGANI — Smooth Paper Page Transition Wrapper
 * 
 * Key Improvements:
 * 1. ZERO Scaling (no scale 0.988 -> 1): Completely eliminates font rasterizer trembling & jitter.
 * 2. Subtle Micro-Slide: Only 4-5px gentle glide (not 10px harsh jump) so the page never feels forced.
 * 3. Soft Ambient Paper Shadow: Creates an elegant, lightweight "paper sheet" tactile settling effect.
 * 4. Web Compositor Acceleration: Runs as GPU-accelerated CSS keyframe animation with will-change.
 * 5. Native Driver on Mobile: Runs on Android & iOS RenderThread at 60fps.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface ScreenTransitionProps {
  transitionKey: string;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  transitionKey,
  style,
  children,
}) => {
  // Web Platform: Pure hardware-accelerated CSS keyframes on the compositor thread
  if (Platform.OS === 'web') {
    return (
      <div
        key={transitionKey}
        className="bagani-paper-page-transition"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'transparent',
          ...(style ? (StyleSheet.flatten(style) as any) : {}),
        }}
      >
        {children}
      </div>
    );
  }

  // Native Mobile (Android & iOS): Native driver on UI RenderThread
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 230,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [transitionKey]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 1],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 0],
  });

  return (
    <Animated.View
      key={transitionKey}
      style={[
        styles.fill,
        styles.nativePaperShadow,
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  nativePaperShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
});
