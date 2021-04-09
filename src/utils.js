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

export async function takeScreenshot(
  selector = '#phone-case-inner',
  filename = `foto-rehearsal-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`,
) {
    return new Promise((resolve) => {
      window.html2canvas(
        document.querySelector(selector),
        { scale: 4 },
      )
        .then((canvas) => {
          canvas.toBlob((blob) => {
            window.saveAs(blob, filename);
            resolve();
          });
        });
    });
}

export function useWindowSize() {
    const width = ref(window.innerWidth);
    const height = ref(window.innerHeight);
    useEventListener('resize', () => {
      width.value = window.innerWidth;
      height.value = window.innerHeight;
    });
    return { width, height };
  }

  const Serializers = {
    boolean: {
      read(v) { return v === 'true'; },
      write(v) { return String(v); },
    },
    object: {
        read(v, d) { return v ? JSON.parse(v) : d; },
        write(v) { return JSON.stringify(v); },
      },
      number: {
        read(v, d) { return v != null ? Number.parseFloat(v) : d; },
        write(v) { return String(v); },
      },
      any: {
        read(v, d) { return v !== null && v !== undefined ? v : d; },
        write(v) { return String(v); },
      },
      string: {
        read(v, d) { return v !== null && v !== undefined ? v : d; },
        write(v) { return String(v); },
      },
    };