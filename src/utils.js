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


    export function openDb() {
        return new Promise((resolve) => {
          const request = window.indexedDB.open(STORE_PREFIX, 1);
      
          request.onerror = function (event) {
            alert(`Failed to open db:\n${event.toString()}`);
          };
      
          request.onsuccess = function (event) {
            resolve(request.result);
          };
      
          request.onupgradeneeded = function (event) {
            const db = event.target.result;
            const stores = [];
            for (let i = 0; i < 5; i++) {
              if (!db.objectStoreNames.contains(`posts-${i}`))
                stores.push(db.createObjectStore(`posts-${i}`, { keyPath: 'id' }));
            }
      
            for (let i = 0; i < DEFAULT_POSTS; i++)
              stores[0].put({ id: i, url: DEFAULT_IMAGES[i] || '' });
          };
        });
      }
    
      export function resizedataURL(url, MAX_WIDTH = 512, MAX_HEIGHT = 512) {
        const img = document.createElement('img');
      
        return new Promise((resolve) => {
          img.onload = function () {
            // We create a canvas and get its context.
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
      
            let width = img.width;
            let height = img.height;
      
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            }
            else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
      
            canvas.width = width;
            canvas.height = height;
      
            ctx.drawImage(this, 0, 0, width, height);
      
            resolve(canvas.toDataURL());
      
            img.remove();
          };
      
          img.src = url;
        });
      }