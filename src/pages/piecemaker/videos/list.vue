<template lang="pug">
  card-full
    q-btn(slot="backButton", @click="$router.push({ name: 'piecemaker.groups.list' })", icon="keyboard_backspace", round, small)
    span(slot="form-logo")
    span(slot="form-title") {{ $t('routes.piecemaker.videos.list.title') }}
    // p.caption(slot="form-caption") {{ $t('routes.piecemaker.videos.list.caption') }}
    p
      q-btn(@click="$router.push({ name: 'piecemaker.videos.create', params: { groupId: $route.params.groupId } })",
        color="primary") {{ $t('buttons.add_video') }}
    data-table(:entries="maps", :columns="columns", :actions="actions", @action="onAction")
</template>

<script>
  import DataTable from '../../../components/shared/partials/DataTable'
  import CardFull from '../../../components/shared/layouts/CardFull'
  import Promise from 'bluebird'
  import url from 'url'
  import path from 'path'
  import he from 'he'
  import assignDeep from 'assign-deep'

  export default {
    components: {
      DataTable,
      CardFull
    },
    methods: {
      onAction (type, data) {
        const _this = this
        switch (type) {
        case 'annotate':
          return _this.$router.push(`/piecemaker/videos/${data.row.uuid}/annotate`)
        case 'edit':
          return _this.$router.push(`/piecemaker/videos/${data.row.uuid}/edit`)
        case 'synchronize':
          return _this.$router.push(`/mosys/codarts/sync/${_this.$route.params.groupId}/${data.row.uuid}`)
        case 'delete':
          _this.$store.dispatch('annotations/remove', data.row.uuid)
              .then(() => { _this.maps = _this.loadVideos() })
        }
      },
      loadVideos () {
        const _this = this
        return this.$store.dispatch('annotations/find', { query: { 'body.purpose': 'linking', 'target.id': this.$route.params.groupId } })
          .then(entries => {
            return Promise.map(entries, entry => {
              const newEntry = assignDeep({}, entry)
              newEntry.title = entry.body.source
              return Promise.resolve()
                .then(() => {
                  if (entry.body.source.indexOf('http') !== 0) return
                  if (path.extname(url.parse(entry.body.source).path) === '.mp4') return
                  // TODO: check if change from superagent to axios is breaking
                  return _this.$axios.get(`${_this.$globalConfig.app.hosts.api}/proxy?url=${encodeURIComponent(entry.body.source)}`)
                    .then(result => {
                      let title = result.text.match(/<title[^>]*>([^<]+)<\/title>/)[1]
                      newEntry.title = he.decode(title)
                    })
                    .catch(err => {
                      console.warn(`Error getting title for ${entry.body.source}: ${err.message}`)
                    })
                })
                .then(() => {
                  return newEntry
                })
            })
          })
      }
    },
    mounted () {
      const _this = this
      _this.maps = this.loadVideos()
    },
    data () {
      const _this = this
      return {
        maps: [],
        columns: [
          {
            label: _this.$t('labels.video_title'),
            field: 'title',
            type: 'string',
            sort: true,
            filter: true
          },
          {
            label: _this.$t('labels.created'),
            field: 'created',
            type: 'date',
            sort: true
          },
          {
            label: _this.$t('labels.updated'),
            field: 'updated',
            type: 'date',
            sort: true
          },
          {
            label: _this.$t('labels.author'),
            field: 'author'
          }
        ],
        actions: [
          { type: 'annotate', title: 'buttons.annotate', color: 'primary' },
          { type: 'edit', title: 'buttons.edit' },
          { type: 'synchronize', title: 'buttons.synchronize' },
          { type: 'delete', title: 'buttons.delete', icon: 'highlight off' }
        ]
      }
    }
  }
</script>

<style>
</style>
