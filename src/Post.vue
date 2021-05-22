<template>
    <div ref="frame" class="frame" :style="style">
      <slot>
        <input
          v-if="!post.url || mode === 0"
          class="upload"
          type="file"
          multiple
        />
        <pre v-if="mode === 1" class="info" :style="infoStyle">{{ info }}</pre>
        <div v-if="mode === 2" class="dots" :style="dotsStyle">
          <div v-for="c of colors.slice(1)" :key="c" class="dot" :style="{ background: c }" />
        </div>
      </slot>
      <img
        v-show="mode === 0 && loaded && post.url"
        class="image"
        :src="post.url"
        @load="onLoad"
      />
    </div>
  </template>
  
  <script>
  import { computed, ref, watch, onMounted } from 'vue'
  import { getDataUrls, getColors } from './utils.js'
  
  export default {
    props: {
      size: { type: Number, default: 0 },
      mode: { type: Number, default: 0 },
      shooting: { type: Boolean, default: false },
      post: { type: Object, default: () => ({ url: '' }) },
    },
    setup(props, ctx) {
      const gap = ref(8)
      const loaded = ref(false)
      const imageStyle = ref({})
  
      const colors = ref([])
      onMounted(() => {
        watch(
          () => props.post.url,
          async () => {
            if (props.post.url)
              colors.value = await getColors(props.post.url, 5)
            else
              colors.value = []
          },
          { immediate: true, flush: 'pre' },
        )
      })
  
      const style = computed(() => {
        const obj = {
          width: `${props.size}px`,
          height: `${props.size}px`,
        }
      })
  
      const dotsStyle = computed(() => {
        return {
          backgroundColor: colors.value[0],
          height: `${(props.size - gap.value * 5) / 4}px`,
          gridGap: `${gap.value}px`,
          padding: `${gap.value}px`,
        }
      })
  
      const info = computed(() => {
        if (!colors.value[0])
          return ''
        const hex = colors.value[0]
        const color = window.chroma(hex)
        const [hue, sat, light] = color.hsl()
  
        return `${hex}\n\n`
          + `lum ${Math.round(light * 100)}%\n`
          + `sat ${Math.round(sat * 100)}%\n`
          + `hue ${hue.toFixed(1)}°`
      })
  
      const infoStyle = computed(() => {
        if (!colors.value[0])
          return {}
        const color = window.chroma(colors.value[0])
        return {
          color: color.luminance() > 0.5
            ? color.darken(2)
            : color.brighten(2),
        }
      })
  
      const onImageSelect = async (e) => {
        const urls = await getDataUrls(e.target.files)
        ctx.emit('upload', urls)
      }
  
      return {
        imageStyle,
        loaded,
        onLoad,
        gap,
        info,
        style,
        onImageSelect,
      }
    },
  }
  </script>
  