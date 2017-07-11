import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import ApiDoc from '@/components/ApiDoc'
import DocDoc from '@/components/DocDoc'
import FaqDoc from '@/components/FaqDoc'
import Learn from '@/components/Learn'

Vue.use(Router)

export default new Router({
  base: '/graphql-factory/',
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main
    },
    {
      path: '/learn',
      name: 'learn',
      component: Learn
    },
    {
      path: '/api',
      name: 'api',
      component: ApiDoc
    },
    {
      path: '/docs',
      name: 'docs',
      component: DocDoc
    },
    {
      path: '/faq',
      name: 'faq',
      component: FaqDoc
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
