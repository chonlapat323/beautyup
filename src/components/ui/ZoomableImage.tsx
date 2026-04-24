import { useRef } from "react";
import { Animated } from "react-native";
import { PinchGestureHandler, TapGestureHandler, State } from "react-native-gesture-handler";

import { CommerceImage } from "./CommerceImage";

type Props = {
  uri: string;
  width: number;
  height: number;
};

export function ZoomableImage({ uri, width, height }: Props) {
  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = useRef(Animated.multiply(baseScale, pinchScale)).current;
  const lastScale = useRef(1);

  const doubleTapRef = useRef(null);

  const onPinchEvent = Animated.event([{ nativeEvent: { scale: pinchScale } }], {
    useNativeDriver: true,
  });

  function onPinchStateChange(e: { nativeEvent: { oldState: number; scale: number } }) {
    if (e.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current = Math.min(Math.max(lastScale.current * e.nativeEvent.scale, 1), 4);
      baseScale.setValue(lastScale.current);
      pinchScale.setValue(1);
    }
  }

  function onDoubleTap(e: { nativeEvent: { state: number } }) {
    if (e.nativeEvent.state === State.ACTIVE) {
      lastScale.current = 1;
      Animated.spring(baseScale, { toValue: 1, useNativeDriver: true }).start();
    }
  }

  return (
    <TapGestureHandler
      ref={doubleTapRef}
      onHandlerStateChange={onDoubleTap}
      numberOfTaps={2}
    >
      <Animated.View>
        <PinchGestureHandler
          onGestureEvent={onPinchEvent}
          onHandlerStateChange={onPinchStateChange}
          simultaneousHandlers={doubleTapRef}
        >
          <Animated.View style={{ width, height, transform: [{ scale }] }}>
            <CommerceImage uri={uri} style={{ width, height }} resizeMode="contain" />
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </TapGestureHandler>
  );
}
