<script>
    import {mapGetters, mapActions} from 'vuex';

    export default {
        props: ["value", "name"],
        mounted() {
            $(this.$el).find("input").iCheck({
                checkboxClass: 'icheckbox_square-green',
                radioClass: 'iradio_square-green',
            }).on("ifChecked", (event) => {
                this.$emit('input', event.target.value);
            }).iCheck('update');
            this.$store.watch(() => {
                return this.value;
            }, () => {
                $(this.$el).find("input").iCheck("update");
            })
        }
    }
</script>

<template>
    <div>
        <label class="checkbox-inline i-checks">
            <input value="true" :name="name" type="radio" :checked="value === true"> Yes
        </label>
        <label class="checkbox-inline i-checks">
            <input value="false" :name="name" type="radio" :checked="value === false"> No
        </label>
    </div>
</template>
