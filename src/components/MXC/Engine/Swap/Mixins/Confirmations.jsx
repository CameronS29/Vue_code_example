import moment from "moment";
import { PUSH_TO_POOL } from "../../../../../store/modules/jobs";
import { sortBy, filter } from "lodash/collection";
import { reverse } from "lodash/array";
import { DateTime } from "luxon";
import { LUXON_DATE_FORMAT } from "./Fields";
const DATE_FORMAT = "MM/DD/YYYY";

export default {
  methods: {
    saveSwap() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        $("html, body").stop().animate({scrollTop: 0}, 500, 'swing');
      } else if (this.isRemoval) {
        this.$confirm('Are you sure that you want to remove this engine?', 'Warning', {
          confirmButtonText: 'Remove engine',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => this.pushData())
          .catch(() => this.$message({type: 'info', message: 'Removal canceled'}));
      } else {
        if (this.id) {
          this.pushData();
          return;
        }
        this.$msgbox({
          message: <div>
            <div>
              You are removing the engine <strong>{this.closestSwap().engine_data.serial_number} </strong>
              on {DateTime.fromString(this.removalDate, LUXON_DATE_FORMAT, {zone: 'utc'}).toFormat("MMMM dd, yyyy")}
              installing the engine <strong>{this.selectedSwap.serial_number}</strong>
              on date {DateTime.fromString(this.installDate, LUXON_DATE_FORMAT, {zone: 'utc'}).toFormat("MMMM dd, yyyy")}.
            </div>
            <br/>
            <div>
              The LAST log with this engine <strong>{this.closestSwap().serial_number} </strong>
              is:
            </div>
            <div>
              <strong>PIC:</strong> <span>{this.log.manifest.pic_name} </span>
              <strong>SIC:</strong> <span>{this.log.manifest.sic_name} </span>
              <strong>Manifest #:</strong> <span>{this.log.manifest.number} </span>
              <strong>Flight #:</strong> <span>{this.log.flight.flight_number} </span>
              <strong>Origin:</strong> <span>{this.log.flight.origin} </span>
              <strong>Destination:</strong> <span>{this.log.flight.destination} </span>
            </div>
          </div>,
          title: `From aircraft ${this.selectedAircraft.registration}`,
          confirmButtonText: 'Yes, remove & install new engine',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => this.pushData())
          .catch(() => this.$message({type: 'info', message: 'Swap canceled'}));
      }
    },
    closestSwap() {
      if (this.swaps && this.removalDate) {
        let swaps = filter(this.swaps, (swap) => moment(this.removalDate) < moment(swap.removalDate));
        swaps = reverse(sortBy(this.swaps, (a) => (moment(a.removalDate))));
        return swaps[0];
      }
    },
    pushData() {
      return this.updateSwap().then((data) => {
        if (this.isRemoval) {
          this.$router.push({
            name: 'engine_swap_list', params: {
              aircraft: this.aircraft,
            }
          });
        } else {
          this.$router.push({
            name: 'mxc_state', query: {
              aircraft: this.aircraft,
              ordering: "date",
              date_0: moment(this.removalDate).format(DATE_FORMAT)
            }
          });
        }
        this.recalcSwap((data) => {
          this[PUSH_TO_POOL](data.uid);
        });
      }).catch((data) => {
        this.$notify.error({
          title: 'Error',
          message: <div>
            {
              this.isRemoval ?
                <span>Engine cannot be removed. Please, check dates.</span> :
                <span>The engine that you selected as replacement, can’t be removed automatically from
                      its current aircraft. Please, remove/swap it manually.</span>
            }
          </div>
        });

      });
    },
  },
};
