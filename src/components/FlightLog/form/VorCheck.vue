<script>
    import {mapGetters, mapActions, mapMutations} from 'vuex';
    import {
        SET_CONFIRM,
        SET_DATE,
        SET_ERROR,
        SET_FREQ,
        SET_STATION,
        SET_PIC_PIN,
        SET_MANIFEST_ID,
        SET_PIC_INITIALS,
        RESET_VOR_CHECK,
    } from '../../../store/modules/flightlog/vor-check';
    import YesNo from "../../fields/YesNo.vue";
    import Datepicker from "../../fields/Datepicker.vue";
    import {required, minLength, maxLength, between} from 'vuelidate/lib/validators';

    const touchMap = new WeakMap();

    export default {
        props: ["objectId", "blockEdit", "picInitial", "manifestId", "status", "djangoFormError"],
        computed: {
            ...mapGetters("manifest/vorCheck", [
                "errors",
                "confirmed",
                "progress",
                "vorCheck",
                'editable'
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
                        // this.$store.dispatch("manifest/vorCheck/setStatus");
                    } else {
                        this[SET_CONFIRM](false);
                        this.$v.$reset();
                        this.$store.dispatch("manifest/vorCheck/deleteConfirmation");
                        this.$store.dispatch("manifest/vorCheck/setStatus");
                    }
                }
            },
            date: {
                get() {
                    return this.vorCheck.date;
                },
                set(value) {
                    this[SET_DATE](value);
                }
            },
            station: {
                get() {
                    return this.vorCheck.station;
                },
                set(value) {
                    this[SET_STATION](value);
                }
            },
            freq: {
                get() {
                    return this.vorCheck.freq;
                },
                set(value) {
                    this[SET_FREQ](value.replace(",", "."));
                }
            },
            picPin: {
                get() {
                    return this.vorCheck.pic_pin;
                },
                set(value) {
                    this[SET_PIC_PIN](value);
                }
            },
            picInitials: {
                get() {
                    return this.vorCheck.pic_initials;
                },
                set(value) {
                    this[SET_PIC_INITIALS](value);
                }
            },
            error: {
                get() {
                    return this.vorCheck.error;
                },
                set(value) {
                    this[SET_ERROR](value);
                }
            },
            errorValues: {
                get() {
                    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                }
            }
        },
        validations: {
            freq: {
                required,
                between: between(108, 118)
            },
            station: {
                required,
                between: maxLength(3)
            },
            error: {
                required
            },
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
            ...mapMutations("manifest/vorCheck", [
                SET_CONFIRM,
                SET_DATE,
                SET_ERROR,
                SET_FREQ,
                SET_STATION,
                SET_PIC_PIN,
                SET_PIC_INITIALS,
                SET_MANIFEST_ID,
                RESET_VOR_CHECK
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
                        this.$store.dispatch("manifest/vorCheck/pushVORConfirmation");
                    }
                });
            },
            unlock() {
                this[SET_CONFIRM](null);
                this.$v.$reset();
                this.$store.dispatch("manifest/vorCheck/deleteConfirmation");
                this.$store.dispatch("manifest/vorCheck/setStatus");
            }
        },
        created() {
            this[RESET_VOR_CHECK]();
            this[SET_PIC_INITIALS](this.picInitial);
            this[SET_MANIFEST_ID](this.manifestId);
            var v = parseInt(this.status + '');
            this[SET_CONFIRM](v === 1 ? true : (v === 2 ? false : null));
        },
        mounted() {
            if (this.objectId) {
                this.$store.dispatch("manifest/vorCheck/getVORConfirmation", this.objectId);
            }
        },
        components: {
            YesNo,
            Datepicker
        }
    }
</script>

<template>
<div :class="{ 'has-error': showErrorBorder }">
    <div class="ibox float-e-margins vor-check-container">
        <div class="ibox-title">
            <h5>VOR Check</h5>
            <div class="ibox-tools">
                <a class="collapse-link">
                    <i class="fa fa-chevron-up"></i>
                </a>
            </div>
        </div>
        <div class="ibox-content p-md" v-if="blockEdit && editable">
            <label>Was a VOR check completed?</label>
            <strong>No</strong>
        </div>
        <div class="ibox-content p-md" v-if="!blockEdit || !editable">
        <div class="alert alert-warning" v-if="!picInitials">
             Selected pilot doesn't have initials defined. Please change it and refresh the page
        </div>
            <div class="approval-flow">
                <div class="approval-choice">
                    <div class="form-group" v-if="!blockEdit">

                        <label>Was a VOR check completed?</label>
                        <yes-no v-model="confirmedModel" name="vor" ></yes-no>
                    </div>
                </div>
                <div class="approval-value" v-if="confirmed">

                    <div class="alert alert-danger" v-for="error in errors" v-if="editable">
                        {{ error }}
                    </div>
                    <div class="row">
                        <div class="col-lg-4 col-xs-12">
                            <div class="form-group"  :class="{ 'has-error': $v.station.$error }">
                                <label>Station</label>
                                <div v-if="editable">
                                    <input type="text" v-model="station" class="form-control"  @input="delayTouch($v.station)">
                                    <span class="help-block vue-err" v-if="!$v.station.required">This field is required</span>
                                    <span class="help-block vue-err" v-if="!$v.station.maxLength">
                                        Station shouldn't contain more than 3 characters
                                    </span>
                                </div>
                                <div v-else>
                                    {{ station }}
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4 col-xs-12">
                            <div class="form-group" :class="{ 'has-error': $v.freq.$error }">
                                <label>Freq</label>

                                <div v-if="editable">
                                    <input class="form-control" v-model="freq" @input="delayTouch($v.freq)">
                                    <span class="help-block vue-err" v-if="!$v.freq.required">This field is required</span>
                                    <span class="help-block vue-err" v-if="!$v.freq.between">
                                        This value should be between 108 - 118
                                    </span>
                                </div>
                                <div v-else>
                                    {{ freq }}
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4 col-xs-12">
                            <div class="form-group" :class="{ 'has-error': $v.error.$error }">
                                <label>Error</label>
                                <div v-if="editable">
                                    <select class="form-control" v-model="error" @change="$v.error.$touch()">
                                        <option v-for="value in errorValues" :value="value"><span v-if="value!=0">+/-</span>{{value}}</option>
                                    </select>
                                    <span class="help-block vue-err" v-if="!$v.error.required">This field is required</span>
                                </div>
                                <div v-else>
                                    <span v-if="error!=0">+/-</span>{{ error }}
                                </div>
                            </div>
                        </div>
                    </div>
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
                                {{ vorCheck.reviewer.first_name }} {{ vorCheck.reviewer.last_name }}
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
                    <div v-if="!blockEdit" class="vor-check-container__submit-btns">
                        <button class="btn btn-success btn-rounded" type="button" @click="submit" v-if="editable">
                            Approve  <i class="fa fa-refresh fa-spin fa-fw" v-if="progress"></i>
                        </button>
                        <button class="btn btn-primary btn-rounded" type="button" @click="unlock" v-else>
                            Unlock and edit
                        </button>
                    </div>
                </div>
                <div v-else-if="progress">
                    <i class="fa fa-refresh fa-spin fa-2x fa-fw" v-if="progress"></i>
                </div>
            </div>
        </div>
    </div>
</div>
</template>
<style lang="scss">
    .has-error {
        .vor-check-container {
            border: 3px red double;
        }
    }

  .vor-check-container {
    &__submit-btns {
      margin-top: 10px;
    }
  }
</style>
