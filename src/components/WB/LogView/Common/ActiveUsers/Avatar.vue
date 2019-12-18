<script>
  import ColorHash from 'color-hash';
  import { Tooltip } from 'element-ui';

  export default {
    props: {
      name: String,
      surname: String,
      photo: String,
    },

    components: {
      Tooltip,
    },

    created() {
      this.colorHash = new ColorHash();
    },

    computed: {
      color() {
        return this.colorHash.hex(this.fullName);
      },

      fullName() {
        return `${this.name} ${this.surname}`
      },

      showPhoto() {
        return this.photo !== null
          && !this.photo.endsWith('/media/default.png');
      },
    },
  };
</script>

<template>
  <div class="wb-user-avatar">
    <tooltip :content="fullName" placement="top">
      <div class="wb-user-avatar__wrapper" :style="{ background: this.color }">
        <img class="wb-user-avatar__photo" v-if="showPhoto" :src="photo" />
        <div class="wb-user-avatar__full-name" v-else>
          {{ name[0] }}{{ surname[0] }}
        </div>
      </div>
    </tooltip>
  </div>
</template>

<style lang="scss">
  $avatar-size: 50px;

  .wb-user-avatar {
    position: relative;
    height: $avatar-size;
    width: $avatar-size;

    margin: 0 -$avatar-size/2;
    z-index: 1;

    &:hover {
      z-index: 2;
    }

    &__wrapper {
      position: absolute;
      top: 0;
      right: 0;

      overflow: hidden;
      height: $avatar-size;
      width: $avatar-size;
      border-radius: 50%;
      box-shadow: 0 0 2px rgba(0, 0, 0, .4);

      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    &__photo {
      max-width: 100%;
      height: auto;
    }

    &__full-name {
      user-select: none;
      cursor: default;
      color: white;
      font-size: 22px;
    }
  }
</style>
