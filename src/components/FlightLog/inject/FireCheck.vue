<script>
    import {mapGetters, mapActions} from 'vuex';

    export default {
        computed: {
            ...mapGetters("manifest/fireCheck", [
                "fireCheck",
                "confirmed",
            ]),
            identification(){
                if (!this.confirmed) {
                    return '';
                }
                return this.fireCheck.id || '';
            }
        },
    }
</script>

<template>
    <input type="hidden" name="fire_confirmation" :value="identification">
</template>
