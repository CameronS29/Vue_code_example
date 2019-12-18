<script>
  import {mapGetters, mapActions} from 'vuex';

  export default {
    props: {
      cssCls: String,
      comments: Array
    }
  };
</script>

<template>
  <div v-if="comments.length > 0" :class="cssCls" style="text-align: left;">
    <i class="fa fa-commenting text-warning" aria-hidden="true"></i> Dispatch Comments:
    <p v-for="comment in comments">
      <label>{{comment.commentor_name}}:</label>
        {{comment.comment}}
      <sub>  {{comment.created_at|shortDT}}</sub>
    </p>
  </div>
</template>
