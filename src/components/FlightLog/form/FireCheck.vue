<script>
    import {mapGetters, mapActions, mapMutations} from 'vuex';
    import {
        SET_DATE,
        SET_PIC_PIN,
        SET_PIC_INITIALS,
        SET_MANIFEST_ID,
        SET_CONFIRM,
        RESET_FIRE_CHECK,
    } from '../../../store/modules/flightlog/fire-check';
    import YesNo from "../../fields/YesNo.vue";
    import Datepicker from "../../fields/Datepicker.vue";
    import {required, minLength, maxLength, between} from 'vuelidate/lib/validators';

    const touchMap = new WeakMap();

    export default {
        props: ["objectId", "blockEdit", "picInitial", "manifestId", "status", "djangoFormError"],
        computed: {
            ...mapGetters("manifest/fireCheck", [
                "confirmed",
                "fireCheck",
                "progress",
                'editable',
                'errors',
            ]),
            showErrorBorder: {
                get() {
                    return this.confirmed === null && this.djangoFormError;
                }
            },
            confirmedModel: {
                get() {
                    return this.confirmed;
                },
                set(value) {
                    if (value === "true") {
                        this[SET_CONFIRM](true);
                    } else {
                        this[SET_CONFIRM](false);
                        this.$v.$reset();
                        this.$store.dispatch("manifest/fireCheck/deleteConfirmation");
                        this.$store.dispatch("manifest/fireCheck/setStatus");
                    }
                }
            },
            date: {
                get() {
                    return this.$store.state.manifest.fireCheck.fireCheck.approve_date;
                },
                set(value) {
                    this[SET_DATE](value);
                }
            },
            picPin: {
                get() {
                    return this.$store.state.manifest.fireCheck.fireCheck.pic_pin;
                },
                set(value) {
                    this[SET_PIC_PIN](value);
                }
            },
            picInitials: {
                get() {
                    return this.$store.state.manifest.fireCheck.fireCheck.pic_initials;
                },
                set(value) {
                    this[SET_PIC_INITIALS](value);
                }
            }
        },
        validations: {
            date: {
                required
            },
            picPin: {
                required
            },
            picInitials: {
                required
            }
        },
        methods: {
            ...mapMutations("manifest/fireCheck", [
                SET_CONFIRM,
                SET_DATE,
                SET_PIC_PIN,
                SET_PIC_INITIALS,
                SET_MANIFEST_ID,
                RESET_FIRE_CHECK,
            ]),
            delayTouch ($v) {
                $v.$reset();
                if (touchMap.has($v)) {
                    clearTimeout(touchMap.get($v));
                }
                touchMap.set($v, setTimeout($v.$touch, 1000));
            },
            submit() {
                this.$v.$touch();
                this.$nextTick(() => {
                    if (!this.$v.$error) {
                        this.$store.dispatch("manifest/fireCheck/pushFireConfirmation");
                    }
                });
            },
            unlock() {
                this.$v.$reset();
                this[SET_CONFIRM](null);
                this.$store.dispatch("manifest/fireCheck/setStatus");
                this.$store.dispatch("manifest/fireCheck/deleteConfirmation");
            }
        },
        mounted() {
          if (this.objectId) {
              this.$store.dispatch("manifest/fireCheck/getFireConfirmation", this.objectId);
          }
        },
        created() {
            this[RESET_FIRE_CHECK]();
            this[SET_PIC_INITIALS](this.picInitial);
            this[SET_MANIFEST_ID](this.manifestId);
            var v = parseInt(this.status+'');
            this[SET_CONFIRM](v === 1 ? true : (v === 2 ? false : null));
        },
        components: {
            YesNo,
            Datepicker
        }
    }
</script>

<template>
<div :class="{ 'has-error': showErrorBorder }">
    <div class="ibox float-e-margins fire-check-container">
        <div class="ibox-title">
            <h5>Fire Extinguisher Check</h5>
            <div class="ibox-tools">
                <a class="collapse-link">
                    <i class="fa fa-chevron-up"></i>
                </a>
            </div>
        </div>
        <div class="ibox-content p-md" v-if="blockEdit && editable">
            <label>Was a fire extinguisher check completed?</label>
            <strong>No</strong>
        </div>
        <div class="ibox-content p-md" v-if="!blockEdit || !editable">
            <div class="approval-flow">
                <div class="approval-choice">
                    <div class="alert alert-danger" v-for="error in errors" v-if="editable">
                        {{ error }}
                    </div>
                    <div class="form-group" v-if="!blockEdit">

                        <label>Was a fire extinguisher check completed?</label>
                        <yes-no v-model="confirmedModel"  name="fire" ></yes-no>
                    </div>
                </div>
                <div class="approval-value" v-if="confirmed">
                    <div class="row">
                        <div class="col-lg-4 col-xs-12" v-if="editable">
                            <div class="form-group" :class="{ 'has-error': $v.picPin.$error }">
                                <label>PIC PIN</label>
                                <input type="password" class="form-control" v-model="picPin">
                                <span class="help-block vue-err" v-if="!$v.picPin.required" @input="$v.picPin.$touch()">This field is required</span>
                            </div>
                        </div>
                        <div class="col-lg-4 col-xs-12" v-if="editable">
                            <div class="form-group" :class="{ 'has-error': $v.picInitials.$error }">
                                <label>PIC Initital</label>
                                <input disabled type="text" class="form-control" v-model="picInitials" @input="$v.picInitials.$touch()">
                                <span class="help-block vue-err" v-if="!$v.picInitials.required">This field is required</span>
                            </div>
                        </div>
                        <div class="col-lg-4 col-xs-12" v-if="!editable">
                            <label>Reviewer:</label>
                            <div>
                                {{ fireCheck.reviewer.first_name }} {{ fireCheck.reviewer.last_name }}
                            </div>
                        </div>
                        <div class="col-lg-4 col-xs-12">
                            <div class="form-group" :class="{ 'has-error': $v.date.$error }" v-if="editable">
                                <datepicker v-model="date" label="Date" @input="delayTouch($v.date)"></datepicker>
                                <span class="help-block vue-err" v-if="!$v.date.required">This field is required</span>
                            </div>
                            <div v-if="!editable">
                                <label>Date</label>
                                <div>{{ date }}</div>
                            </div>
                        </div>
                    </div>
                    <div v-if="!blockEdit" class="fire-check-container__submit-btns">
                        <button class="btn btn-success btn-rounded" type="button" @click="submit" v-if="editable">
                            Approve
                        </button>
                        <button class="btn btn-primary btn-rounded" type="button" @click="unlock" v-else>
                            Unlock and edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>
<style lang="scss">
    .has-error {
        .fire-check-container {
            border: 3px red double;
        }
    }

    .fire-check-container {
      &__submit-btns {
        margin-top: 10px;
      }
    }

</style>
