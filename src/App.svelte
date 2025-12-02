<script>
  import Header from './Header.svelte'
  import Footer from './Footer.svelte'
  import Subscribe from './Subscribe.svelte'
  import Archive from './Archive.svelte'
  import ScheduleMeeting from './ScheduleMeeting.svelte'
  import FeaturedContent from './FeaturedContent.svelte'
  import Podcasts from './Podcasts.svelte'
  import Newsletters from './Newsletters.svelte'

  let currentPage = 'home'
  let menuOpen = false

  function navigateTo(page) {
    currentPage = page
    window.scrollTo(0, 0)
  }

  // Listen for hash changes for back/forward navigation
  function handleHashChange() {
    const hash = window.location.hash.slice(1)
    if (hash === 'subscribe') {
      currentPage = 'subscribe'
    } else if (hash === 'podcasts') {
      currentPage = 'podcasts'
    } else if (hash === 'newsletters') {
      currentPage = 'newsletters'
    } else if (hash === 'archive' || hash === 'content') {
      currentPage = 'archive'
    } else if (hash === 'schedule') {
      currentPage = 'schedule'
    } else {
      currentPage = 'home'
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', handleHashChange)
    // Set initial page based on URL hash
    handleHashChange()
  }
</script>


<Header brand="UnkleAyo" bind:menuOpen />

<main class="app-main" class:hidden={menuOpen}>
  {#if currentPage === 'home'}
    <div class="content-container">
      <section class="hero">
        <nav class="additional-links">
          <a href="https://www.youtube.com/@unkleayo">YouTube</a>
          <a href="https://www.linkedin.com/in/unkleayo/" target="_blank">LinkedIn</a>
          <a href="#subscribe">E-mail</a>
        </nav>
      </section>

      <FeaturedContent {navigateTo} />
    </div>
    <Footer />
  {:else if currentPage === 'subscribe'}
    <Subscribe />
  {:else if currentPage === 'podcasts'}
    <Podcasts />
  {:else if currentPage === 'newsletters'}
    <Newsletters />
  {:else if currentPage === 'archive'}
    <Archive />
  {:else if currentPage === 'schedule'}
    <ScheduleMeeting />
  {/if}
</main>

<style>
  .app-main.hidden {
    display: none;
  }
</style>

