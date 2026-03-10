import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const isNative = Capacitor.isNativePlatform();

function noop() {}

export const haptics = {
  poopDrop: isNative
    ? () => Haptics.impact({ style: ImpactStyle.Light })
    : noop,
  hitHuman: isNative
    ? () => Haptics.impact({ style: ImpactStyle.Medium })
    : noop,
  birdHit: isNative
    ? () => Haptics.impact({ style: ImpactStyle.Heavy })
    : noop,
  gameOver: isNative
    ? () => Haptics.notification({ type: NotificationType.Error })
    : noop,
};
