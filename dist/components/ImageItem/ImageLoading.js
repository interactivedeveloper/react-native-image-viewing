/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
export const ImageLoading = () => {
    const [dimensions, setDimensions] = useState({
        window: Dimensions.get("window"),
        screen: Dimensions.get("screen"),
    });
    const SCREEN = dimensions.screen;
    const SCREEN_WIDTH = SCREEN.width;
    const SCREEN_HEIGHT = SCREEN.height;
    useEffect(() => {
        const subscription = Dimensions.addEventListener("change", ({ window, screen }) => {
            setDimensions({ window, screen });
        });
        return () => { var _a; return (_a = subscription) === null || _a === void 0 ? void 0 : _a.remove(); };
    });
    return (<View style={[styles.loading, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
      <ActivityIndicator size="small" color="#FFF"/>
    </View>);
};
const styles = StyleSheet.create({
    loading: {
        alignItems: "center",
        justifyContent: "center",
    },
});
