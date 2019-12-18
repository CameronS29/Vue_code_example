<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

  import ItemModal from './ItemModal.vue';

  export default {
    created() {
      if (!this.MEL.length) this.fetchMEL();
    },
    components: {
      ItemModal,
    },
    data() {
      return { search: '' };
    },
    computed: {
      ...mapState('aircraft/mel', ['categories']),
      ...mapGetters('aircraft/mel', ['MEL']),

      filteredMel() {
        if (!this.search.length) return this.MEL;

        return this.MEL.filter(item => `${item.code}${item.description}`.toUpperCase()
          .indexOf(this.search.toUpperCase()) > -1);
      },
    },
    methods: {
      ...mapMutations('aircraft/mel', ['setCurrentMELItem']),
      ...mapActions('aircraft/mel', ['fetchMEL', 'deleteMELItem']),
      ...mapActions('aircraft', ['getAircraftTypes']),

      category(item) {
        return this.categories[item.category];
      },

      addItem() {
        this.setCurrentMELItem({});
      },

      editItem(item) {
        this.setCurrentMELItem(item);
      },

      async deleteItem(item) {
        await this.$confirm('This will permanently delete MEL record. Continue?', 'Warning', {
          type: 'warning',
        });

        this.deleteMELItem(item);
      },
    },
  };
</script>

<template>
  <div class="mel">
    <portal to="header">
      <div class="mel__header-items">
        <el-button type="primary" @click="addItem" round icon="el-icon-plus">Add new</el-button>
        <el-input placeholder="Search..." v-model="search" />
      </div>
    </portal>

    <el-table size="mini" border :data="filteredMel" :default-sort="{ prop: 'code' }">
      <el-table-column
        width="86"
      >
        <template slot-scope="props">
          <div class="mel__controls">
            <el-button @click="editItem(props.row)" size="mini" type="primary" plain icon="el-icon-edit" circle />
            <el-button @click="deleteItem(props.row)" size="mini" type="danger" plain icon="el-icon-delete" circle />
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="aricraft_type_name"
        sortable
        label="Aircraft Type"
      >
        <template slot-scope="props">
          {{ props.row.aircraft_type_name }}
        </template>
      </el-table-column>

      <el-table-column
        prop="code"
        sortable
        label="Code"
      >
        <template slot-scope="props">
          {{ props.row.code }}
        </template>
      </el-table-column>

      <el-table-column
        prop="description"
        sortable
        label="Description"
      >
        <template slot-scope="props">
          {{ props.row.description }}
        </template>
      </el-table-column>

      <el-table-column
        prop="category"
        sortable
        label="Repair category"
      >
        <template slot-scope="props">
          {{ category(props.row) }}
        </template>
      </el-table-column>

      <el-table-column
        prop="expiration"
        sortable
        label="Days until expiration"
      >
        <template slot-scope="props">
          {{ props.row.expiration }}
        </template>
      </el-table-column>

      <el-table-column
        prop="operational_restrictions"
        sortable
        label="Operational restrictions"
      >
        <template slot-scope="props">
          {{ props.row.operational_restrictions }}
        </template>
      </el-table-column>
    </el-table>

    <item-modal />
  </div>
</template>


<style lang="scss">
  .mel {
    &__header-items {
      display: flex;
      > *:not(:last-child) {
        margin-right: 20px;
      }
    }
    &__controls {
      .el-button + .el-button {
        margin-left: 5px;
      }
    }
  }
</style>
