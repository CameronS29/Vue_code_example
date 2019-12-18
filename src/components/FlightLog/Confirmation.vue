<script>
    import {mapGetters, mapActions, mapMutations} from 'vuex';
    import {
        OPEN_COMPLETE_WINDOW,
        CLOSE_COMPLETE_WINDOW
    } from "../../store/modules/flightlog/manifest";
    import moment from "moment";

    export default {
        props: ['id'],
        computed: {
            ...mapGetters("manifest", [
                "manifest",
                "completeWindowOpen"
            ])
        },
        methods: {
            ...mapMutations('manifest', [
                OPEN_COMPLETE_WINDOW,
                CLOSE_COMPLETE_WINDOW
            ]),
            ...mapActions('manifest', [
                "getManifest"
            ]),
            submit() {
              $('#id_open').val('False');
              this[CLOSE_COMPLETE_WINDOW]();
              $('#manifest-form').submit();
            },
            cancel() {
              this[CLOSE_COMPLETE_WINDOW]();
            }
        },
        created() {
            this.getManifest(parseInt(this.id));
        },
        filters: {
          moment: function (date) {
            return moment(date).format("MMMM Do YYYY");
          },
          momentTime: function (date) {
            return moment(date).format("MMMM Do YYYY, h:mm:ss a");
          },
        }
    }
</script>

<template>
    <div v-if="completeWindowOpen">
        <div tabindex="-1" role="dialog" class="bootbox modal fade bootbox-confirm in" >
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-body">
                        <div class="bootbox-body" v-if="manifest.id">
                            <div class="headlines">
                                <div class="headline">FLIGHT LOG</div>
                                <div class="headline">FLIGHT MANIFEST #{{ manifest.number }}</div>
                                <div class="headline">FLIGHT MANIFEST {{ manifest.aircraft.registration }}</div>
                            </div>
                            <div class="info-section">
                                <div class="info-section-title">
                                    Crew information
                                </div>
                                <div>
                                    <span class="info-label">Date:</span>
                                    <span class="info-value">{{ manifest.created_on|moment }}</span>
                                </div>
                                <div>
                                    <span class="info-label">PIC:</span>
                                    <span class="info-value">
                                        {{ manifest.pic_profile.personal_data.first_name }}
                                        {{ manifest.pic_profile.personal_data.last_name }}
                                    </span>
                                </div>
                                <div>
                                    <span class="info-label">SIC:</span>
                                    <span class="info-value">
                                        {{ manifest.sic_profile.personal_data.first_name }}
                                        {{ manifest.sic_profile.personal_data.last_name }}
                                    </span>
                                </div>
                                <div>
                                    <span class="info-label">Number of pilots:</span>
                                    <span class="info-value">
                                        {{ manifest.number_of_pilots }}
                                    </span>
                                </div>
                                <div>
                                    <span class="info-label">Name of reporting pilot:</span>
                                    <span class="info-value">
                                        {{ manifest.created_by.personal_data.first_name }}
                                        {{ manifest.created_by.personal_data.last_name }}
                                    </span>
                                </div>
                            </div>
                            <div v-for="flightlog in manifest.flightlogs">
                                <div class="info-section">
                                    <div class="info-section-title">
                                        Flight information
                                    </div>
                                    <div>
                                        <span class="info-label">Aircraft tail number:</span>
                                        <span class="info-value">
                                            {{ manifest.aircraft.registration }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Aircraft type:</span>
                                        <span class="info-value">
                                            {{ manifest.aircraft_type }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Type of operation (part 91/135):</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.operating_under }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Flight number:</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.flight_number }}
                                        </span>
                                    </div>
                                    <br>

                                    <div>
                                        <span class="info-label">Type of operations:</span>
                                        <span class="info-value">
                                            {{ manifest.operation_type }}
                                        </span>
                                    </div>
                                    <br>
                                    <div>
                                        <span class="info-label">Flight log number:</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.flight_log_number || "Empty" }}
                                        </span>
                                    </div>
                                    <br>
                                    <div>
                                        <span class="info-label">Origin:</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.origin }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Destination:</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.destination }}
                                        </span>
                                    </div>
                                    <br>
                                    <div>
                                        <span class="info-label">Scheduled Depature Date/time:</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.scheduled_depature|momentTime }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Scheduled Arrival Date/time:</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.scheduled_arrival|momentTime }}
                                        </span>
                                    </div>
                                </div>
                                <div class="info-section">
                                    <div class="info-section-title">
                                        Pilot input
                                    </div>
                                    <div>
                                        <span class="info-label">Number of passengers on board:</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.number_of_passengers }}
                                        </span>
                                    </div>
                                    <br>
                                    <div>
                                        <span class="info-label">Actual date/time OUT</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.actual_datetime_out|momentTime }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Actual date/time OFF</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.actual_datetime_off|momentTime }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Actual date/time ON</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.actual_datetime_on|momentTime }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Actual date/time IN</span>
                                        <span class="info-value">
                                            {{ flightlog.flight.actual_datetime_in|momentTime }}
                                        </span>
                                    </div>
                                    <br>
                                    <div>
                                        <span class="info-label">Flight time</span>
                                        <span class="info-value">
                                            {{ flightlog.flight_time }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Block time</span>
                                        <span class="info-value">
                                            {{ flightlog.block_time }}
                                        </span>
                                    </div>
                                    <br>
                                    <div>
                                        <span class="info-label">Number of take-offs (day):</span>
                                        <span class="info-value">
                                            {{ flightlog.number_of_takeoffs_day }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Number of take-offs (night):</span>
                                        <span class="info-value">
                                            {{ flightlog.number_of_takeoffs_night }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Number of landings (day):</span>
                                        <span class="info-value">
                                            {{ flightlog.number_of_landings_day }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="info-label">Number of landings (night):</span>
                                        <span class="info-value">
                                            {{ flightlog.number_of_landings_night }}
                                        </span>
                                    </div>
                                    <br>
                                    <div class="plain-info">
                                        <span class="info-label">Total number of landings:</span>
                                        <span class="info-value">
                                            {{ flightlog.number_of_landings_night + flightlog.number_of_landings_day }}
                                        </span>
                                    </div>
                                </div>
                                <div class="plain-section">
                                    <span class="info-label">Total number of landings:</span>
                                    <span class="info-value">
                                        {{ flightlog.number_of_landings_night + flightlog.number_of_landings_day }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="bootbox-body" v-else>

                            <i class="fa fa-refresh fa-spin fa-3x fa-fw"></i>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn btn-danger btn-rounded"  @click="cancel">CANCEL</button>
                        <button type="button" class="btn btn btn-info btn-rounded" @click="submit">Submit to dispatch</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade in"></div>
    </div>
</template>
<style lang="scss">
    .bootbox {
        display: block!important;
        overflow-y: auto!important;
        .headlines {
            margin-bottom: 10px;
        }
        .headline {
            color: #fff;
        }
    }
    .info-section {
        border-bottom: 1px solid #fff;
        padding-bottom: 5px;
        margin-bottom: 5px;
        text-align: left;
        font-size: 16px;
        color:#fff;
        &-title {
            font-weight: bold;
            text-transform: uppercase;
        }
    }
    .plain-section {
        text-align: left;
        font-size: 16px;
        color:#fff;
    }
    .info-label {
    }
</style>
