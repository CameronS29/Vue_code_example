<script>
  import { mapGetters, mapActions } from 'vuex';
  import map from 'lodash/map';
  import filter from 'lodash/filter';
  import last from 'lodash/last';

  import BreadcrumbItem from './BreadcrumbItem.vue';

  export default {
    props: {
      defaultTitle: String,
    },

    components: {
      BreadcrumbItem,
    },

    computed: {
      matchedTitle() {
        const {title} = this.$route.meta;
        if (title !== undefined) {
          return title;
        }
        const titles = filter(map(this.$route.matched, 'meta.title'));
        return last(titles);
      },
    },
  };
</script>

<template>
  <div class="fltops-navigation-header">
    <div class="fltops-navigation-header__title">
      <span v-if="matchedTitle">{{ matchedTitle }}</span>
      <span v-else="defaultTitle">{{ defaultTitle }}</span>
    </div>

    <div class="fltops-navigation-header__breadcrumbs">
      <breadcrumb-item
        v-for="record in $route.matched"
        v-if="record.meta.breadcrumb !== undefined"
        :key="record.path"
        :record="record"
        class="fltops-navigation-header__breadcrumb-item"
        :class="{'breadcrumbs__item_main': record.meta.main}"
      />
    </div>
  </div>
</template>

<style lang="scss">
  @import "../../../../../scss/bs-variables";

  .fltops-navigation-header {
    background: transparent;
    padding: 0;
    margin: 0;
    min-width: 0;

    &__title {
      font-size: 24px;
      font-weight: 100;
      line-height: 28px;
      margin: 3px 0 5px 0;

      @media screen and (max-width: $screen-xs-max) {
        font-size: 16px;
        line-height: 24px;
        overflow: hidden;
      }
    }

    &__breadcrumbs {
      display: flex;
      flex-flow: row nowrap;
      align-items: flex-start;

      @media screen and (max-width: $screen-xs-max) {
        display: none;
      }

    }

    &__breadcrumb-item {
      &:not(:last-of-type):after {
        display: inline-block;
        margin: 0 5px;
        content: ' / ';
        color: #ccc;
      }

      a {
        border-radius: 3px;
        padding: 3px 0;
        color: rgb(103, 106, 108);
      }
    }
  }
</style>
