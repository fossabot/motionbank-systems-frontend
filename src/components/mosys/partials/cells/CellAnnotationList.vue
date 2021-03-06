<template lang="pug">

  div.annotation-list(:class="{'display-preview': preview, 'display-full': display}")
    template(v-if="display")
        q-list-header
          q-item
            video-title(:source="video.body.source")
        template(v-for="(annot, index) in annotations")
          q-item-separator

          template(v-if="$store.state.auth.payload.userId && showAnnotationInput(index)")
            q-item.annotation-input-container
              q-input.annotation-input(type="textarea", max-height="200", min-rows="3"
                style="width:100%", v-model="newAnnotationText",
                @keyup.enter="handleInputChanged", stack-label="Leave Comment")
            q-item-separator

          q-item.annotation
            a(:class="{'active': contextTime && inContextTime(annot, index)}",
              @click.prevent="event => {handleAnnotationClick(event, annot, index)}")
              span.date {{formatDate(annot, index).split(':').slice(1).join(':')}}
              Username.author(:uuid="annot.author")
              span.content {{annot.body.value}}

        q-item-separator

    template(v-else)
      strong Annotation List

</template>

<script>
  import { DateTime } from 'luxon'
  import constants from '../../../../lib/constants'
  import Username from '../../../shared/partials/Username'
  import VideoTitle from '../../../shared/partials/VideoTitle'
  import annotations from '../../../../lib/annotations'

  const TimelineSelector = annotations.selectors.TimelineSelector

  export default {
    components: {
      Username,
      VideoTitle
    },
    props: ['cell', 'display', 'preview', 'messenger'],
    data () {
      return {
        videoUuid: '',
        video: {},
        videoTime: {},
        contextTime: {},
        annotations: [],
        map: {},
        annotationTimes: [],
        inputIndex: 0,
        newAnnotationText: ''
      }
    },
    mounted () {
      const _this = this
      this.videoUuid = this.cell.content
      if (this.messenger) {
        this.messenger.$on('video-time-changed', (time, globalTime, origin) => {
          if (origin.type === 'Video' &&
            _this.video.target.id === origin.origin.target.id &&
            _this.videoTime <= globalTime) {
            _this.contextTime = globalTime
            let inputTime = _this.annotationTimes.find(t => {
              return t >= _this.contextTime
            })
            if (inputTime) {
              _this.inputIndex = _this.annotationTimes.indexOf(inputTime)
            }
            else {
              _this.inputIndex = 0
            }
          }
        })
      }
    },
    watch: {
      videoUuid () {
        this.fetchAnnotations()
      }
    },
    methods: {
      handleInputChanged () {
        const _this = this
        if (this.newAnnotationText) {
          let newAnnotation = {
            author: this.$store.state.auth.payload.userId,
            type: 'Annotation',
            body: {
              type: 'TextualBody',
              purpose: 'commenting',
              value: this.newAnnotationText
            },
            target: {
              id: this.map.uuid,
              type: this.map.type,
              selector: {
                type: 'Fragment',
                value: TimelineSelector.fromMilliseconds(_this.contextTime).isoString
              }
            }
          }
          this.$store.dispatch('annotations/create', newAnnotation)
            .then(() => {
              _this.fetchAnnotations()
            })
        }
        this.newAnnotationText = ''
      },
      handleAnnotationClick (event, annot, index) {
        this.messenger.$emit('annotation-trigger', annot, this.annotationTimes[index])
      },
      inContextTime (annot, index) {
        const dist = this.annotationTimes[index] - this.contextTime
        return Math.abs(dist) < 2000 // 2 secs?
      },
      contextTimeDiff (annot, index) {
        return this.annotationTimes[index] - this.contextTime
      },
      formatDate (annot) {
        return DateTime
          .fromISO(annot.target.selector.value)
          .minus(this.videoTime)
          .toFormat(constants.TIMECODE_FORMAT)
      },
      showAnnotationInput (index) {
        return index === this.inputIndex
      },
      fetchAnnotations () {
        const _this = this
        this.$store.dispatch('annotations/find', {query: {'uuid': this.videoUuid}})
          .then(videoAnnotations => {
            const videoAnnotation = videoAnnotations.shift()
            if (videoAnnotation) {
              _this.video = videoAnnotation
              _this.videoTime = Date.parse(_this.video.target.selector.value)
              _this.contextTime = _this.videoTime
              _this.$store.dispatch('maps/find', {query: {'uuid': videoAnnotation.target.id}})
                .then(maps => {
                  const map = maps.shift()
                  if (map) {
                    _this.map = map
                  }
                })
              _this.$store.dispatch('annotations/find', {query: {'target.id': videoAnnotation.target.id, 'body.purpose': 'commenting'}})
                .then(annotations => {
                  annotations = annotations.filter(a => {
                    return Date.parse(a.target.selector.value) >= _this.videoTime
                  })
                  annotations = annotations.sort((a, b) => {
                    let tDiff = Date.parse(a.target.selector.value) - Date.parse(b.target.selector.value)
                    if (tDiff === 0) {
                      tDiff = Date.parse(b.created) - Date.parse(a.created)
                    }
                    return tDiff
                  })
                  _this.annotations = annotations
                  _this.annotationTimes = []
                  annotations.forEach(a => {
                    _this.annotationTimes.push(Date.parse(a.target.selector.value))
                  })
                })
            } // TODO: else, show not found?
          })
      }
    }
  }
</script>

<style scoped lang="stylus">

  .annotation-list
    width 100%
    height 100%
    overflow auto

  .annotation-list.display-full
    background-color white

  .annotation-list.display-preview
    color #666

  a.active
    color orangered

  .q-list-header
    padding-top 0.5em
    padding-left 0

    .q-item
      font-size 1em
      line-height 1.5em

  .annotation

    a
      width 100%

    .date
    .author
      font-size 0.8em
      color lightgray
      padding-right 1em
      float left

    .author
      float right

    .content
      width 100%

  .q-input.annotation-input
    margin-top 0.5em

  .annotation-input-container
    margin-top -0.5em
    margin-bottom -0.5em
    border-left 10px solid #95b4ff

  .annotation-input-container:hover
    background-color #e7e9ff

</style>
