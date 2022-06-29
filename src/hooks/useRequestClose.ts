/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState } from 'react';

const useRequestClose = (
  onRequestClose: () => void,
  setImageIndex: (n: number) => void
) => {
  const [opacity, setOpacity] = useState(1);

  return [
    opacity,
    () => {
      setImageIndex(0);
      setOpacity(0);
      onRequestClose();
      setTimeout(() => setOpacity(1), 0);
    },
  ] as const;
};

export default useRequestClose;
