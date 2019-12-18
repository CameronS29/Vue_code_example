<script>
  const defaultMessages = {
    required: 'This field is required',
    requiredIf: 'This field is required',
  };

  export default {
    props: ["validationData"],
    inject: {
      formFieldErrors: {default: {}},
      formGlobalErrors: {default: []},
    },
    computed: {
      errors() {
        if (!this.validationData) {
          return [];
        }
        return Object.keys(this.validationData.$params).map(field => {
          let messages = this.formFieldErrors;
          if (!this.validationData[field] && this.formGlobalErrors.indexOf(field) === -1) {
            if (messages && messages[field]) {
              return messages[field]();
            } else if (defaultMessages[field]) {
              return defaultMessages[field];
            } else {
              return "Unknown error";
            }
          }
        }).filter((val) => val);
      }
    }
  }
</script>

<template>
  <div>
    <div v-for="error in errors">
      {{ error }}
    </div>
  </div>
</template>
