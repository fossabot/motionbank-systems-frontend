<template lang="pug">

  div(style="height: calc(100vh - 52px); overflow: hidden;")
    q-layout#video-annotate-wrap

      div#btn-back
        q-btn(@click="$router.push('/piecemaker/groups/' + groupId + '/videos')",
          color="grey", icon="keyboard_backspace", round, flat, small)
        q-btn(v-if="!fullscreen", @click="toggleFullscreen(), fullscreenHandler()", icon="fullscreen", round, flat, small)
        q-btn(v-if="fullscreen", @click="toggleFullscreen(), fullscreenHandler()", icon="fullscreen_exit", round, flat, small)

      div(style="height: calc(100vh - 52px); overflow: hidden;")
        video-player(v-if="video", :src="video", @ready="playerReady($event)", @time="onPlayerTime($event)")

      #pop-up(v-bind:class="{ activeCondition: active }")

        div.text-right.outline(@click="toggleForm()", v-if="!active", color="primary")
          | Start typing or click here

        div(v-if="active")
          q-input(@keyup.enter="createAnnotation()", @keyup.esc="toggleForm(); closePopUp()",
            v-model="currentBody.value", type="textarea", float-label="Start typing", autofocus)
          div.row
            .col-6
              q-btn(@click="toggleForm()", small) Esc
            .col-6.text-right
              q-btn(@click="createAnnotation()", small) Enter

      #annotation-wrap(v-if="!fullscreen" slot="right")
        q-list.no-border
          q-item.annotation(v-for="(annotation, i) in annotations", :class="{ highlight: i === currentIndex }", :key="annotation.uuid", :id="annotation.uuid")
            q-item-main.row
              q-item-tile.col-6
                q-btn(v-if="annotation.target.selector", @click="gotoSelector(annotation.target.selector.value), changeState()", small) {{ formatSelectorForList(annotation.target.selector.value) }}
              q-item-tile.col-6
                q-btn(@click="deleteAnnotation(annotation.uuid), changeState()", small) {{ $t('buttons.delete') }}
                q-btn(@click="updateAnnotation(annotation), addKeypressListener()", small) {{ $t('buttons.save') }}
              q-item-tile.col-12.author
                username(:uuid="annotation.author")
              q-item-tile.col-12
                q-input(@click="changeState(), hideForm()", type="textarea", v-model="annotation.body.value")

</template>

<script>
  import { AppFullscreen } from 'quasar'
  import assert from 'assert'
  import assignDeep from 'assign-deep'
  import uuidValidate from 'uuid-validate'
  import VideoPlayer from '../../../components/shared/media/VideoPlayer'
  import annotations from '../../../lib/annotations'
  import constants from '../../../lib/constants'
  import Username from '../../../components/shared/partials/Username'

  const TimelineSelector = annotations.selectors.TimelineSelector

  export default {
    components: {
      VideoPlayer,
      Username
    },
    mounted () {
      const _this = this
      if (this.$route.params.id) {
        this.getVideo().then(() => _this.getAnnotations())
      }
      window.addEventListener('keypress', this.toggleForm)
    },
    beforeDestroy () {
      window.removeEventListener('keypress', this.toggleForm)
      AppFullscreen.exit()
    },
    data () {
      return {
        fullscreen: false,
        player: undefined,
        playerTime: 0.0,
        currentIndex: undefined,
        video: undefined,
        groupId: undefined,
        baseSelector: undefined,
        active: false,
        annotations: [],
        currentBody: {
          value: undefined,
          purpose: 'commenting',
          type: 'TextualBody'
        },
        currentSelector: {
          type: 'Fragment',
          value: undefined
        },
        filtertypes: [{
          title: 'Comment'
        }, {
          title: 'Marker'
        }
        ]
      }
    },
    methods: {
      toggleFullscreen () {
        AppFullscreen.toggle()
      },
      changeState () {
        this.active = false
        this.currentSelector.value = undefined
        this.currentBody.value = undefined
        window.addEventListener('keypress', this.toggleForm)
      },
      hideForm () {
        window.removeEventListener('keypress', this.toggleForm)
      },
      addKeypressListener () {
        window.addEventListener('keypress', this.toggleForm)
      },
      fullscreenHandler () {
        this.fullscreen = !this.fullscreen
      },
      getVideo () {
        const context = this
        return this.$store.dispatch('annotations/get', context.$route.params.id)
          .then(result => {
            if (result.body) {
              context.groupId = result.target.id
              context.video = result.body
              context.baseSelector = TimelineSelector.fromISOString(result.target.selector.value)
            }
          })
      },
      getAnnotations () {
        const
          context = this,
          query = {
            'target.id': context.groupId,
            'target.type': constants.MAP_TYPE_TIMELINE,
            'body.type': 'TextualBody'
          }
        return this.$store.dispatch('annotations/find', { query })
          .then(results => {
            if (results) {
              context.annotations = results.sort(annotations.Sorting.sortOnTarget)
            }
          })
      },
      toggleForm () {
        if (this.active) {
          this.active = false
          this.currentSelector.value = undefined
          this.currentBody.value = undefined
          window.addEventListener('keypress', this.toggleForm)
        }
        else {
          window.removeEventListener('keypress', this.toggleForm)
          if (!this.player) return
          const selector = TimelineSelector.fromDateTime(this.baseSelector.dateTime)
          let seconds = this.player.currentTime()
          selector.add(seconds * 1000)
          this.currentSelector.value = selector.isoString
          this.active = true
        }
      },
      createAnnotation () {
        const _this = this
        const annotation = {
          author: _this.$store.state.auth.payload.userId,
          body: assignDeep({}, _this.currentBody),
          target: {
            id: _this.groupId,
            type: constants.MAP_TYPE_TIMELINE,
            selector: assignDeep({}, _this.currentSelector)
          }
        }
        return this.$store.dispatch('annotations/create', annotation)
          .then(res => {
            _this.getAnnotations().then(() => {
              _this.scrollToElement(res.uuid)
            })
          })
          .then(() => _this.toggleForm())
      },
      scrollToElement (uuid) {
        window.location.href = '#' + uuid
      },
      updateAnnotation (annotation) {
        assert.equal(typeof annotation, 'object')
        assert(uuidValidate(annotation.uuid))
        assert.equal(typeof annotation.body.value, 'string')
        return this.$store.dispatch('annotations/patch', [annotation.uuid, annotation])
          .then(() => this.getAnnotations())
      },
      deleteAnnotation (uuid) {
        assert(uuidValidate(uuid))
        return this.$store.dispatch('annotations/remove', uuid)
          .then(() => this.getAnnotations())
      },
      gotoSelector (selector) {
        selector = TimelineSelector.fromISOString(selector)
        selector.subtract(this.baseSelector.millis)
        this.player.currentTime(selector.millis * 0.001)
      },
      playerReady (player) {
        this.player = player
      },
      formatSelectorForList (val) {
        const selector = TimelineSelector.fromISOString(val)
        // selector.subtract(this.baseSelector.millis)
        return selector.toFormat(constants.TIMECODE_FORMAT)
      },
      onPlayerTime (seconds) {
        this.playerTime = seconds
        this.updateHighlight(seconds)
      },
      updateHighlight (seconds) {
        if (!this.annotations.length) return
        let
          baseMillis = this.baseSelector.millis + seconds * 1000,
          annoCount = this.annotations.length,
          selector, idx = 0, running = true
        while (running && this.annotations[idx]) {
          selector = this.annotations[idx].target.selector
            ? TimelineSelector.fromISOString(this.annotations[idx].target.selector.value) : undefined
          running = selector && baseMillis < selector.millis
          if (!running) this.currentIndex = idx
          if (idx >= annoCount) break
          idx++
        }
        if (running) this.currentIndex = undefined
      }
    }
  }
</script>

<style scoped>
  #btn-back {
    position: absolute;
    top: 1em;
    left: 1em;
    z-index: 9999;
  }
  #pop-up {
    position: absolute;
    top: 1em;
    right: 1em;
    width: 33%;
    cursor: pointer;
  }
    #pop-up > div {
      padding: 1em;
      background-color: white;
    }
  .activeCondition {
    box-shadow: 0 0 10px -2px rgba( 0, 0, 0, .35 );
    background-color: rgba( 255, 255, 255, 1 );
  }
  .outline {
    border: 1px solid white;
    position: absolute;
    right: 0;
  }
  .annotation {
  }
    .annotation:hover {
      background-color: rgba( 0, 0, 0, .05 );
    }
  #annotation-wrap {
  }
    #annotation-wrap > div {
      padding-top: 0;
      height: 100%;
      overflow-x: scroll;
      padding-bottom: 100vh;
    }
  .author {
    font-size: .8em;
    padding-top: 5px;
  }
  .highlight {
    /* background-color: rgba( 0, 255, 0, .5 );
    transition: background-color ease 500ms; */
  }
  .layout-page {
    height: calc(100vh - 52px)!important;
    overflow: hidden!important;
  }

</style>
