<template lang="pug">
  .row.fullscreen.vertical-middle.justify-center.items-center
    .column.col-12.sm-gutter
      q-card.full-width(color="dark")
        .layout-padding
          q-card-main.no-margin
            .row.justify-between.content-stretch
              .column.width-3of4
                h4.caption.light-paragraph.no-margin
                  slot(name="form-title")
                slot(name="form-caption")
              slot(name="form-logo")
                a.gt-md.logo(@click="openURL('http://www.motionbank.org')")
                  img.responsive(src="~assets/motionbank-logo.png")
          q-card-main.no-margin
            slot
      site-footer
</template>

<script>
  import { openURL } from 'quasar'
  import SiteFooter from '../partials/SiteFooter'
  export default {
    components: {
      SiteFooter
    },
    data: function () {
      return {
        openURL
      }
    }
  }
</script>

<style></style>
