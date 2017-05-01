<template>
  <div id="fullpage">
    <div class="section" style="background-color: #eeeeee;">
      <div style="height: 100%;">
        <div class="container-fullwidth" style="padding-top: 100px; padding-bottom: 100px;background-color: #333;">
          <img src="../assets/logo.svg" style="width: 80px;">
          <span style="display: inline-block; vertical-align: middle; color: #00A9DD; font-size: 3em; font-family: 'Rubik', 'Helvetica Neue', Helvetica, Arial, sans-serif;">GraphQL Factory</span>
        </div>
      </div>
    </div>
    <div class="section" style="background-color: #ff807d;">Some section2</div>
    <div class="section" style="background-color: #79acff;">Some section3</div>
    <div class="section">Some section4</div>
  </div>
</template>

<script type="text/babel">
  import $ from 'jquery'
  import 'fullpage.js/dist/jquery.fullpage'

  export default {
    mounted () {
      $('#fullpage').fullpage()
    }
  }
</script>
