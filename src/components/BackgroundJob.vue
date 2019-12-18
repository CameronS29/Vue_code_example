<template>
    <button type="button" class="btn btn-primary btn-rounded create-new" @click="start">
        <span v-if="!loading && !completed">
            {{ label }}
        </span>
        <span v-else-if="!loading && completed">
            <i class="fa fa-check"></i> Completed
        </span>
        <span v-else-if="loading && !msg">
            <i class="fa fa-circle-o-notch fa-spin fa-fw"></i> Loading...
        </span>
        <span v-else>
            <i class="fa fa-circle-o-notch fa-spin fa-fw"></i> {{msg}}
        </span>
    </button>
</template>

<script>
    import axios from 'axios';

    export default {
        props: ['task', 'label'],
        data() {
            return {
                loading: false,
                completed: false,
                job_id: -1,
                job_status: null,
                job_name: this.task,
                msg: "",
            }
        },
        created: function () {
            this.job_id = localStorage.getItem(`${this.job_name}_task_id`);
            if (this.job_id) {
                this.loading = true;
                this.$nextTick(function () {
                    this.createWatcher();
                });
            }
        },
        methods: {
            setJobId(uid) {
                localStorage.setItem(`${this.job_name}_task_id`, uid);
                this.job_id = uid;
            },
            setJobStatus(status) {
                if (status === "SUCCESS" || status === "FAILURE") {
                    clearInterval(this.interval);
                    this.completed = true;
                    this.loading = false;
                    setTimeout(n => {
                        localStorage.removeItem(`${this.job_name}_task_id`);
                        if (this.lastStatus) {
                            window.location.reload();
                        }
                    }, 500)
                }
                this.lastStatus = status;
            },
            start() {
                this.loading = true;
                axios.get(`/api/job/run/${this.job_name}/`)
                    .then(response => {
                        this.setJobId(response.data.uid);
                        this.createWatcher();
                    })
            },
            createWatcher() {
                this.interval = setInterval(loop => {
                    axios.get(`/api/job/${this.job_id}/`)
                        .then(response => {
                            this.setJobStatus(response.data.status);
                            this.msg = response.data.meta.description;
                        })
                }, 500)
            }
        }
    }
</script>
