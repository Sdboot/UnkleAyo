<script>
  import Header from './Header.svelte'
  import Footer from './Footer.svelte'
  import Subscribe from './Subscribe.svelte'
  import Archive from './Archive.svelte'
  import ContentSections from './ContentSections.svelte'

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
    } else if (hash === 'archive') {
      currentPage = 'archive'
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
          <a href="#archive">YouTube</a>
          <a href="https://www.linkedin.com/in/unkleayo/" target="_blank">LinkedIn</a>
          <a href="#subscribe">E-mail</a>
        </nav>
      </section>

      <ContentSections />
    </div>
    <Footer />
  {:else if currentPage === 'subscribe'}
    <Subscribe />
  {:else if currentPage === 'archive'}
    <Archive />
  {/if}
</main>

<style>
  .app-main.hidden {
    display: none;
  }
</style>

