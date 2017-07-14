<template lang="pug">
  #app
    navbar
    mobile-nav
    router-view
</template>

<script type="text/babel">
  import Navbar from '@/components/Navbar'
  import MobileNav from '@/components/MobileNav'
  export default {
    name: 'app',
    components: {
      Navbar,
      MobileNav
    },
    computed: {
      store () {
        return this.$deepModel('data')
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 0px;
    background-color: #fdfdfd;
  }

  body {
    position: absolute;
    overflow: auto;
    width: 100%;
    height: 100%;
    -webkit-transition: all 0.3s ease;
    -moz-transition: all 0.3s ease;
    transition: all 0.3s ease;
    right: 0px;
    top: 0px;
    bottom: 0px;
  }
</style>
