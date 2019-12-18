<script>
    import {mapGetters, mapActions} from 'vuex';

    export default {
        computed: {
            ...mapGetters("manifest/vorCheck", [
                "vorCheck",
                "confirmed",
            ]),
            identification(){
                if (!this.confirmed) {
                    return '';
                }
                return this.vorCheck.id || '';
            }
        },
    }
</script>

<template>
    <input type="hidden" name="vor_confirmation" :value="identification">
</template>
