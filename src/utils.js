/* eslint-disable no-alert */
import { ref, onMounted, onUnmounted, watch } from 'vue';

export const STORE_PREFIX = 'helga-photos-posts';
export const CONFIG_PREFIX = 'helga-photos-config';
const DEFAULT_POSTS = 8;
const DEFAULT_IMAGES = [
  '/examples/photo-1588055312392-97068a233ee2.jpeg',
];

function useEventListener(type, listener, options, target) {
  if (target === undefined) target = window;
  onMounted(() => {
    target.addEventListener(type, listener, options);
  });
  onUnmounted(() => {
    target.removeEventListener(type, listener, options);
  });
}