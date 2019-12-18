<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import Group from 'Common/Form/Group.vue';
  import TextField from 'Common/Form/Fields/TextField.vue';
  import NumberField from 'Common/Form/Fields/NumberField.vue';
  import TextAreaField from 'Common/Form/Fields/TextAreaField.vue';
  import AircraftType from 'Common/Form/Fields/AircraftType.vue';
  import { required } from 'vuelidate/lib/validators';

  const prop = name => ({
    get() {
      return this.item[name];
    },
    set(value) {
      this.item = {
        ...this.item,
        [name]: value,
      };
    },
  });

  export default {
    created() {
      if (!this.secondLevelAircraftTypes.length) {
        this.getAircrafts();
      }
    },
    data() {
      return {
        item: {},
      };
    },
    components: {
      Group,
      TextField,
      NumberField,
      TextAreaField,
      AircraftType,
    },
    computed: {
      ...mapState('aircraft/mel', ['currentMELItem', 'categories', 'categoriesDefaultExpiration']),
      ...mapGetters('aircraft', ['secondLevelAircraftTypes']),

      active: {
        get() {
          return !!this.currentMELItem;
        },
        async set() {
          this.$v.$reset();
          this.setCurrentMELItem(null);
        },
      },

      aircraft_type_name: prop('aircraft_type_name'),
      category: prop('category'),
      code: prop('code'),
      description: prop('description'),
      operational_restrictions: prop('operational_restrictions'),
      expiration: prop('expiration'),
    },
    methods: {
      ...mapActions('aircraft/mel', ['updateMELItem']),
      ...mapMutations('aircraft/mel', ['setCurrentMELItem']),
      ...mapMutations('aircraft', ['getAircrafts']),

      async submit() {
        this.$v.$touch();
        if (this.$v.$invalid) return;

        await this.updateMELItem(this.item);
        this.active = false;
      },
    },
    validations: {
      aircraft_type_name: { required, },
      code: { required, },
      description: { required, },
      operational_restrictions: { required, },
      category: { required, },
      expiration: { required, },
    },
    watch: {
      currentMELItem(item) {
        this.item = { ...item };
      },
      category(newCategory, oldCategory) {
        if (!this.expiration || this.expiration == this.categoriesDefaultExpiration[oldCategory]) {
          this.expiration = this.categoriesDefaultExpiration[newCategory];
        }
      },
    },
  };
</script>

<template>
  <el-dialog :visible.sync="active" :title="item.id ? item.code : 'Add record'" class="mel-modal">
    <group label="Aircraft Type" :validation-data="$v.aircraft_type_name">
      <el-select v-model="aircraft_type_name">
        <el-option
          v-for="type of secondLevelAircraftTypes"
          :key="type"
          :label="type"
          :value="type"
        />
      </el-select>
    </group>
    <group label="Item code" :validation-data="$v.code">
      <text-field v-model="code" />
    </group>
    <group label="Item description" :validation-data="$v.description">
      <text-area-field v-model="description" />
    </group>
    <group label="Operational Restrictions" :validation-data="$v.operational_restrictions">
      <text-area-field v-model="operational_restrictions" />
    </group>
    <group label="Repair category" :validation-data="$v.category">
      <el-select
        v-model="category"
      >
        <el-option
          v-for="(category, index) in categories"
          :key="index"
          :label="category"
          :value="index" />
      </el-select>
    </group>
    <group label="Days until expiration" :validation-data="$v.expiration">
      <number-field v-model="expiration" :max="120" />
    </group>

    <div class="mel-modal__btns">
      <el-button @click="submit" type="primary">{{ item.id ? 'Update' : 'Add' }}</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss">
  .mel-modal {

    &__btns {
      display: flex;
      padding: 10px 20px 0;

      .el-button {
        width: 100%;
      }
    }

    .el-dialog__body {
      padding: 10px 0;
      width: 320px;
    }

    .el-select {
      width: 100%;
    }
  }
</style>
