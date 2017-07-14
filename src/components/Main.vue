<template lang="pug">
  #main.container-fullwidth
    #jumbo.jumbotron.container-fluid
      h2 A graphql toolkit
      h3 Tools for building graphql APIs
      a.btn.btn-lg.btn-primary(id="gitbutton", href="https://github.com/graphql-factory")
        i.fa.fa-lg.fa-code
        span &nbsp;Code on GitHub
      .row
        .col-sm-6.col-sm-offset-3
          prism(language="bash", :plugins="['command-line']")
            | npm install graphql-factory --save
</template>

<script type="text/babel">
  import Prism from 'vue-prismjs'
  export default {
    components: {
      Prism
    }
  }
</script>

<style>
  #main {
    top: -2px;
    position: relative;
  }

  #jumbo {
    color: #00A9DD;
    background-color: #eae8eb;
  }

  #jumbo h2 {
    color: #00A9DD;
    font-weight: bold;
  }

  #jumbo h3 {
    color: #00A9DD;
  }

  #gitbutton {
    margin-top: 40px;
    margin-bottom: 40px;
    background-color: #646168;
    font-weight: bold;
    padding: 15px;
  }

  #gitbutton span {
    vertical-align: middle;
    display: inline-block;
  }
</style>
