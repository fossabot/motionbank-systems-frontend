<template lang="pug">
  div

    side-menu

    .content-wrap
      // content-bar
      h4 Übersicht: Meine Gruppenbeteiligung
      div
        q-btn(outline @click="OpenForm" color="primary") Add video
        q-btn(outline @click="OpenForm" color="primary") Record/Live Edit
        data-table(:entries="maps", :columns="columns", :actions="actions", @action="onAction")

</template>

<script>
  import { QBtn } from 'quasar-framework'
  import ContentBar from '../../../shared/partials/ContentBar'
  import DataTable from '../../../shared/partials/DataTable'
  import CenterCardThreeQuarter from '../../../shared/layouts/CenterCardThreeQuarter'
  import SideMenu from '../../../shared/partials/Sidemenu'
  import CancelButton from '../../../shared/forms/CancelButton'

  import { FormMain } from '../../../shared/forms'
  import { required } from 'vuelidate/lib/validators'
  export default {
    components: {
      ContentBar,
      DataTable,
      CenterCardThreeQuarter,
      SideMenu,
      FormMain,
      CancelButton,
      QBtn
    },
    methods: {
      onAction (type, data) {
        const _this = this
        switch (type) {
        case 'add_video':
          return _this.$router.push(`/annotations/${data.row.uuid}/video`)
        case 'annotate_edit':
          return _this.$router.push(`/annotations/${data.row.uuid}/edit`)
        case 'edit':
          return _this.$router.push(`/maps/${data.row.uuid}/edit`)
        case 'alert_ch':
          return alert('geht')
        case 'delete':
          _this.$store.dispatch('maps/remove', data.row.uuid)
              .then(() => { _this.maps = _this.$store.dispatch('maps/find') })
        }
        console.log('test')
      },
      OpenForm () {
        document.getElementById('piecemaker-add-form').style.display = 'block'
      },
      cancel: function () {
        document.getElementById('piecemaker-add-form').style.display = 'none'
      }
    },
    data () {
      const _this = this
      const context = this

      return {
        maps: _this.$store.dispatch('maps/find'),
        columns: [{
          label: _this.$t('labels.video_title'),
          field: 'title'
        }, {
          label: _this.$t('labels.description'),
          field: 'title'
        }, {
          label: _this.$t('labels.last_annotation'),
          field: 'title'
        }, {
          label: _this.$t('labels.starting_point') + ' (on timeline)',
          field: 'title'
        }, {
          label: _this.$t('labels.duration'),
          field: 'title'
        }
        ],
        actions: [
          { type: 'annotate_edit', title: 'buttons.annotate', color: 'secondary' }
        ],
        payload: undefined,
        schema: {
          fields: {
            title: {
              fullWidth: true,
              type: 'text',
              label: 'labels.video_title',
              errorLabel: 'errors.field_required',
              validators: {
                required
              }
            },
            url: {
              fullWidth: true,
              type: 'text',
              label: 'labels.video_url'
            },
            description: {
              fullWidth: true,
              type: 'textarea',
              label: 'labels.description'
            }
          },
          submit: {
            handler () {
              context.payload.owner = context.$store.state.auth.payload.userId
              context.$store.dispatch('maps/create', context.payload)
                // .then(() => context.$router.push(`/maps`))
                .then(() => context.$router.push(`/piecemaker/list`))
            }
          }
        },
        schemaEdit: {
          fields: {
            title: {
              fullWidth: true,
              type: 'text',
              label: 'labels.edit_title',
              errorLabel: 'errors.field_required',
              validators: {
                required
              }
            },
            description: {
              fullWidth: true,
              type: 'textarea',
              label: 'labels.description'
            },
            status: {
              fullWidth: true,
              type: 'text',
              label: 'labels.status'
            }
          },
          submit: {
            handler () {
              context.payload.owner = context.$store.state.auth.payload.userId
              context.$store.dispatch('maps/create', context.payload)
                // .then(() => context.$router.push(`/maps`))
                .then(() => context.$router.push(`/piecemaker/list`))
            }
          }
        },
        schemaParticipants: {
          fields: {
            status: {
              fullWidth: true,
              type: 'text',
              label: 'labels.email'
            }
          },
          submit: {
            handler () {
              context.payload.owner = context.$store.state.auth.payload.userId
              context.$store.dispatch('maps/create', context.payload)
              // .then(() => context.$router.push(`/maps`))
                .then(() => context.$router.push(`/piecemaker/list`))
            }
          }
        },
        schemaTags: {
          fields: {
            status: {
              fullWidth: true,
              type: 'text',
              label: 'labels.tag'
            }
          },
          submit: {
            handler () {
              context.payload.owner = context.$store.state.auth.payload.userId
              context.$store.dispatch('maps/create', context.payload)
              // .then(() => context.$router.push(`/maps`))
                .then(() => context.$router.push(`/piecemaker/list`))
            }
          }
        },
        test: [{
          label: _this.$t('labels.description'),
          field: 'title'
        }, {
          label: _this.$t('labels.description'),
          field: 'title'
        }, {
          label: _this.$t('labels.last_annotation'),
          field: 'title'
        }, {
          label: _this.$t('labels.embedded'),
          field: 'title'
        }
        ]
      }
    }
  }
</script>

<style>
  .ausstehend {
    opacity: .5;
  }
</style>
