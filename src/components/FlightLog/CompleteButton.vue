<script>
    import {mapMutations} from 'vuex';
    import {
        OPEN_COMPLETE_WINDOW,
        CLOSE_COMPLETE_WINDOW
    } from "../../store/modules/flightlog/manifest";

    export default {

        methods: {
            ...mapMutations('manifest', [
                OPEN_COMPLETE_WINDOW,
                CLOSE_COMPLETE_WINDOW
            ]),
            open() {
              this[OPEN_COMPLETE_WINDOW]();
            }
        },
    }
</script>

<template>
    <button class="btn btn-danger btn-rounded btn-wide" type="button" @click="open">Complete Flight Manifest</button>
</template>
