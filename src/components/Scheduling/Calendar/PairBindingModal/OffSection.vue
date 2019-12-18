<script>
  import { find, get } from 'lodash';

  export default {
    name: 'OffSection',
    props: {
      offTypes: {
        type: Array,
        required: true,
      },

      dayOff: {
        type: Object,
        default: undefined,
      },
    },

    data() {
      return {
        offType: get(this.dayOff, 'shortcut'),
        comments: get(this.dayOff, 'comments'),
      };
    },

    computed: {
      hasChanges() {
        return (!this.dayOff
          || this.offType !== this.dayOff.shortcut
          || this.dayOff.comments !== this.comments);
      },

      fullType() {
        return find(this.offTypes, { abbr: this.offType });
      },
    },

    methods: {
      handleOffClick() {
        const { fullType: type, comments } = this;
        this.$emit('select', { type, comments });
      },

      handleTypeChange(type) {
        this.offType = type;
      },
    },

    watch: {
      dayOff(offRecord) {
        this.offType = get(offRecord, 'shortcut');
        this.comments = get(offRecord, 'comments');
      },
    },
  };
</script>

<template>
  <div class="pair-binding-off">
    <div v-if="dayOff" class="pair-binding-off__description">
      This pilot is off this day.
      Adding any shift will automatically remove
      <strong v-if="fullType">{{ fullType.name }} ({{ offType }})</strong>
      <strong v-else>{{ offType }}</strong>
      mark.
    </div>

    <el-button-group class="pair-binding-off__button-group">
      <el-button :disabled="offType === type.abbr"
                 size="small"
                 type="primary"
                 class="pair-binding-off__button"
                 :title="type.name"
                 @click="handleTypeChange(type.abbr)"
                 :key="type.id"
                 v-for="type in offTypes">
        {{ type.abbr }}
      </el-button>
    </el-button-group>

    <div v-if="offType" class="pair-binding-off__comment-section">
      <el-input class="pair-binding-off__comments"
                v-model="comments"
                @keyup.native.enter="handleOffClick"
                placeholder="Comments (optional)..." />

      <el-button v-if="hasChanges"
                 class="pair-binding-off__apply-button"
                 size="small"
                 type="primary"
                 @click="handleOffClick">
        Set {{ offType }}
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .pair-binding-off {
    padding: 10px;
    background: #f5f3f3;

    &__description {
      font-size: 12px;
      padding: 0;
      margin: 0;
    }

    &__button-group {
      display: flex;
    }

    &__button {
      flex: 1 1;
      padding-left: 0;
      padding-right: 0;
    }

    &__comment-section {
      padding-top: 10px;
      display: flex;
    }

    &__comments {
      flex: 6 6;
    }

    &__apply-button {
      flex: 1 1;
      margin-left: 10px;
    }
  }
</style>
