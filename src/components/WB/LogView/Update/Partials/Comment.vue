<script>
    import {mapGetters, mapActions} from 'vuex';
    import moment from 'moment';

    export default {
        props: ["comment"],
        data() {
            return {"currentDate": this.comment.created_at}
        },
        methods: {
            commitDate() {
                this.currentDate = moment(this.comment.created_at).fromNow();
            }
        },
        computed: {
            ...mapGetters("user", ["user"])
        },
        created() {
            this.commitDate();
            this.interval = setInterval(() => {
                this.commitDate();
            }, 1000*30);
        },
        destroyed() {
            clearInterval(this.interval);
        }
    }
</script>
<template>
    <div class="comment">
        <div class="bubble" :class="{'me': comment.profile.id == user.id}">
            {{ comment.text }}
        </div>
        <div class="date">
            {{ comment.profile.full_name }}, {{ currentDate }}
        </div>
    </div>
</template>
