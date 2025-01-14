/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, {
  ComponentType,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ModalProps,
  StyleSheet,
  View,
  VirtualizedList,
} from 'react-native';

import { ImageSource } from './@types';
import ImageDefaultHeader from './components/ImageDefaultHeader';
import ImageItem from './components/ImageItem/ImageItem';
import StatusBarManager from './components/StatusBarManager';
import useAnimatedComponents from './hooks/useAnimatedComponents';
import useImageIndexChange from './hooks/useImageIndexChange';
import useRequestClose from './hooks/useRequestClose';

type Props = {
  images: ImageSource[];
  keyExtractor?: (imageSrc: ImageSource, index: number) => string;
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
  onLongPress?: (image: ImageSource) => void;
  onImageIndexChange?: (imageIndex: number) => void;
  presentationStyle?: ModalProps["presentationStyle"];
  animationType?: ModalProps["animationType"];
  backgroundColor?: string;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
  delayLongPress?: number;
  HeaderComponent?: ComponentType<{
    imageIndex: number;
    onRequestClose: () => void;
  }>;
  FooterComponent?: ComponentType<{ imageIndex: number }>;
  ArrowLeftComponent?: ComponentType<{
    onPre: () => void;
  }>;
  ArrowRightComponent?: ComponentType<{
    onNext: () => void;
  }>;
};

const DEFAULT_ANIMATION_TYPE = "fade";
const DEFAULT_BG_COLOR = "#000";
const DEFAULT_DELAY_LONG_PRESS = 800;

function ImageViewing({
  images,
  keyExtractor,
  imageIndex,
  visible,
  onRequestClose,
  onLongPress = () => {},
  onImageIndexChange,
  animationType = DEFAULT_ANIMATION_TYPE,
  backgroundColor = DEFAULT_BG_COLOR,
  presentationStyle,
  swipeToCloseEnabled,
  doubleTapToZoomEnabled,
  delayLongPress = DEFAULT_DELAY_LONG_PRESS,
  HeaderComponent,
  FooterComponent,
  ArrowLeftComponent,
  ArrowRightComponent,
}: Props) {
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get("window"),
    screen: Dimensions.get("screen"),
  });
  const SCREEN = dimensions.screen;
  const SCREEN_WIDTH = SCREEN.width;
  const WINDOW = dimensions.window;

  useEffect(() => {
    const subscription: any = Dimensions.addEventListener(
      "change",
      ({ window, screen }) => {
        setDimensions({ window, screen });
      }
    );
    return () => subscription?.remove();
  });

  const imageList = useRef<VirtualizedList<ImageSource>>(null);
  const [currentImageIndex, onScroll, setImageIndex] = useImageIndexChange(
    imageIndex,
    SCREEN
  );
  const [opacity, onRequestCloseEnhanced] = useRequestClose(
    onRequestClose,
    setImageIndex
  );
  const [headerTransform, footerTransform, toggleBarsVisible] =
    useAnimatedComponents();

  useEffect(() => {
    if (onImageIndexChange) {
      onImageIndexChange(currentImageIndex);
    }
  }, [currentImageIndex]);

  const onZoom = useCallback(
    (isScaled: boolean) => {
      // @ts-ignore
      imageList?.current?.setNativeProps({ scrollEnabled: !isScaled });
      toggleBarsVisible(!isScaled);
    },
    [imageList]
  );

  const onPre = () => {
    if (currentImageIndex > 0) {
      (imageList.current as any).scrollToItem({
        animated: true,
        item: images[currentImageIndex - 1],
      });
      setImageIndex((currentImageIndex) => currentImageIndex - 1);
    }
  };

  const onNext = () => {
    if (currentImageIndex < images.length - 1) {
      (imageList.current as any).scrollToItem({
        animated: true,
        item: images[currentImageIndex + 1],
      });
      setImageIndex((currentImageIndex) => currentImageIndex + 1);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent={presentationStyle === "overFullScreen"}
      visible={visible}
      presentationStyle={presentationStyle}
      animationType={animationType}
      onRequestClose={onRequestCloseEnhanced}
      supportedOrientations={["portrait"]}
      hardwareAccelerated
    >
      <StatusBarManager presentationStyle={presentationStyle} />
      <View style={[styles.container, { opacity, backgroundColor }]}>
        <Animated.View style={[styles.header, { transform: headerTransform }]}>
          {typeof HeaderComponent !== "undefined" ? (
            React.createElement(HeaderComponent, {
              imageIndex: currentImageIndex,
              onRequestClose: onRequestCloseEnhanced,
            })
          ) : (
            <ImageDefaultHeader onRequestClose={onRequestCloseEnhanced} />
          )}
        </Animated.View>
        <VirtualizedList
          ref={imageList}
          data={images}
          horizontal
          pagingEnabled
          windowSize={2}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={imageIndex}
          getItem={(_, index) => images[index]}
          getItemCount={() => images.length}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item: imageSrc }) => (
            <ImageItem
              onZoom={onZoom}
              imageSrc={imageSrc}
              onRequestClose={onRequestCloseEnhanced}
              onLongPress={onLongPress}
              delayLongPress={delayLongPress}
              swipeToCloseEnabled={swipeToCloseEnabled}
              doubleTapToZoomEnabled={doubleTapToZoomEnabled}
            />
          )}
          onMomentumScrollEnd={onScroll}
          //@ts-ignore
          keyExtractor={(imageSrc, index) =>
            keyExtractor
              ? keyExtractor(imageSrc, index)
              : typeof imageSrc === "number"
              ? `${imageSrc}`
              : imageSrc.uri
          }
        />
        {typeof ArrowLeftComponent !== "undefined" && (
          <View style={[styles.arrowLeft, { top: WINDOW.height / 2 - 11 }]}>
            {React.createElement(ArrowLeftComponent, {
              onPre,
            })}
          </View>
        )}
        {typeof ArrowRightComponent !== "undefined" && (
          <View style={[styles.arrowRight, { top: WINDOW.height / 2 - 11 }]}>
            {React.createElement(ArrowRightComponent, {
              onNext,
            })}
          </View>
        )}
        {typeof FooterComponent !== "undefined" && (
          <Animated.View
            style={[styles.footer, { transform: footerTransform }]}
          >
            {React.createElement(FooterComponent, {
              imageIndex: currentImageIndex,
            })}
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    top: 0,
  },
  footer: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    bottom: 0,
  },
  arrowLeft: {
    position: "absolute",
    zIndex: 2,
    left: 15,
  },
  arrowRight: {
    position: "absolute",
    zIndex: 2,
    right: 15,
  },
});

const EnhancedImageViewing = (props: Props) => (
  <ImageViewing key={props.imageIndex} {...props} />
);

export default EnhancedImageViewing;
