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