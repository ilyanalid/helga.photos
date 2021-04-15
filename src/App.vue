<template>
  <div v-if="!locked" class="app" :class="{ dark, shooting }">
    <div id="phone-case" :style="caseStyle">
      <div id="phone-case-inner">
        <div class="nav">
          <div v-if="width > 300" class="header">
            Helga
            <br />
            <b>Photos</b>
          </div>
          <div v-show="!shooting" class="buttons">
            <button type="button" class="icon button" title="Take Screenshot" @click="shoot">
              <span class="iconify" data-icon="mdi-light:camera" />
            </button>

            <button
              v-if="isDesktop && !inPopup"
              type="button"
              class="icon button"
              title="Popup"
              @click="openPopup"
            >
              <span class="iconify" data-icon="mdi-light:arrange-send-backward" />
            </button>

            <button type="button" class="icon button" title="New Post" @click="addFront">
              <span class="iconify" data-icon="mdi-light:plus-circle" />
            </button>

            <button
              type="button"
              class="icon button"
              :title="dark ? 'Light Mode' : 'Dark Mode'"
              @click="toggleDark"
            >
              <div v-show="dark">
                <span class="iconify" data-icon="mdi-light:lightbulb-on" />
              </div>
              <div v-show="!dark">
                <span class="iconify" data-icon="mdi-light:lightbulb" />
              </div>
            </button>

            <button type="button" class="icon button" title="Toggle Gap" @click="toggleGap">
              <div v-show="gap">
                <span class="iconify" data-icon="mdi-light:border-all" />
              </div>
              <div v-show="!gap">
                <span class="iconify" data-icon="mdi-light:border-outside" />
              </div>
            </button>

            <button type="button" class="icon button" title="Switch mode" @click="switchMode">
              <div v-show="imageMode == 0">
                <span class="iconify" data-icon="mdi-light:picture" />
              </div>
              <div v-show="imageMode == 1">
                <span class="iconify" data-icon="mdi-light:flask-empty" />
              </div>
              <div v-show="imageMode == 2">
                <span class="iconify" data-icon="mdi-light:flask" />
              </div>
            </button>

            <button type="button" class="icon button" title="Switch Tabs" @click="switchTab">
              <span class="iconify" data-icon="mdi-light:shape-circle" />
              <span class="number">{{ tab + 1 }}</span>
            </button>
          </div>
        </div>

        <div class="grid" :style="{ gridGap: `${gap}px` }">
          <post
            @drop.native="e => drop(idx, e)"
            @dragend.native="dragend"
            @dragover.native="allowDrop"
            @dragenter.native="allowDrop"
            @dragstart.native="e => drag(idx, e)"
            @upload="urls => handleUploaded(idx, urls)"
          />
          <post v-show="!shooting" :size="size" @click.native="add">
            <div class="icon">
              <span class="iconify" data-icon="mdi-light:plus-circle" />
            </div>
          </post>
        </div>

        <div v-if="!shooting" class="footer">
        </div>
      </div>
    </div>
    <div class="toast" :class="{ active: !!toast }">{{ toast }}</div>
    <div
      v-show="!shooting"
      class="trashbin"
      :class="{ active: dragging }"
      :style="caseStyle"
      @drop.native="dropRemove"
      @dragenter.native="allowDrop"
      @dragover.native="allowDrop"
    >Drop here to Remove</div>
  </div>
</template>


/* eslint-disable no-self-assign */
import { computed, ref, watch, nextTick } from 'vue'
import { useWindowSize, loadPosts, savePosts, openDb, popup, useStorage, CONFIG_PREFIX, takeScreenshot } from './utils.js'
import Post from './Post.vue'

const TOAST_TIMEOUT = 2500

export default {
  components: {
    Post,
  },
  setup() {
    const tab = useStorage(`${CONFIG_PREFIX}-tab`, 0)
    const gap = useStorage(`${CONFIG_PREFIX}-gap`, 3)
    const dark = useStorage(`${CONFIG_PREFIX}-dark`, false)

    const { width, height } = useWindowSize()
    const posts = ref([])
    const dragging = ref(false)
    const shooting = ref(false)
    const locked = ref(false)
    const toast = ref('')
    const imageMode = ref(0) // 0: photo, 1: thief, 2: pattele
    let db
    let toastTimer

    openDb().then(async (i) => {
      db = i
      window.db = db
      posts.value = await loadPosts(db, tab.value)
    })

    const PHONE_RATIO = 0.55
    const isDesktop = computed(() => {
      return width.value > 500 && width.value / height.value > PHONE_RATIO
    })
    const caseWidth = computed(() => {
      return Math.min(
        width.value,
        isDesktop.value
          ? height.value * PHONE_RATIO - 5
          : width.value,
      )
    })
    const size = computed(() => {
      return (caseWidth.value - gap.value * 2) / 3
    })
    const caseStyle = computed(() => ({
      width: `${caseWidth.value}px`,
    }))
    const handleUploaded = (index, urls) => {
      for (let i = 0; i < urls.length; i++) {
        // append to tail
        if (!posts.value[i + index])
          posts.value.push({ url: urls[i] })
        // insert into middle
        else if (posts.value[i + index].url)
          posts.value.splice(i + index, 0, { url: urls[i] })
        // replace empty
        else
          posts.value[i + index].url = urls[i]
      }
    }
    const drop = (to, e) => {
      dragging.value = false
      const from = +e.dataTransfer.getData('idx')
      posts.value.splice(to, 0, posts.value.splice(from, 1)[0])
    }
    const dropRemove = (e) => {
      dragging.value = false
      const from = +e.dataTransfer.getData('idx')
      posts.value.splice(from, 1)
    }
    const drag = (idx, e) => {
      dragging.value = true
      e.dataTransfer.setData('idx', idx)
      try {
        window.navigator.vibrate(100)
      }
      catch { }
    }
    const dragend = () => {
      dragging.value = false
    }
    const allowDrop = (e) => {
      e.preventDefault()
      return false
    }
    const add = () => {
      posts.value.push({ url: '' })
    }
    const addFront = () => {
      posts.value.unshift({ url: '' })
    }
    const openPopup = async () => {
      locked.value = true
      toast.value = 'Poped'
      await popup(location.href, 'helga-photos', caseWidth.value, height.value)
      location.reload()
    }
    const shoot = () => {
      shooting.value = true
      toast.value = 'Taking Screenshot'
      nextTick(() => {
        takeScreenshot()
        shooting.value = false
      })
    }
    const toggleDark = () => {
      dark.value = !dark.value
      toast.value = dark.value ? 'Dark mode' : 'Light mode'
    }
    const toggleGap = () => {
      gap.value = gap.value ? 0 : 3
      toast.value = gap.value ? 'Gap on' : 'Gap off'
    }
    const switchMode = () => {
      imageMode.value = (imageMode.value + 1) % 3
      toast.value = ['Image mode', 'Color mode', 'Pattle mode'][imageMode.value]
    }
    const switchTab = () => {
      tab.value = (tab.value + 1) % 3
      toast.value = `Tab ${tab.value + 1}`
    }