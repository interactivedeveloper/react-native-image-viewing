/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
/// <reference types="react" />
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Dimensions } from '../@types';
declare const useImageIndexChange: (imageIndex: number, screen: Dimensions) => readonly [number, (event: NativeSyntheticEvent<NativeScrollEvent>) => void, import("react").Dispatch<import("react").SetStateAction<number>>];
export default useImageIndexChange;
