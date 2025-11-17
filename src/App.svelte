<script>
  import Header from './Header.svelte'
  import ContentCard from './ContentCard.svelte'
  import Footer from './Footer.svelte'
  import Subscribe from './Subscribe.svelte'
  import Archive from './Archive.svelte'

  let currentPage = 'home'

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

const episodes = [
    {
      title: 'Curate People',
      description: 'On recruiting and culture. You\'re listening to the UnkleAyo Show. Today we\'re going to be talking about recruiting, hiring, team, and culture.',
      duration: '06:23',
      date: 'Nov 7 2025',
      link: '#',
      audio: '/goodness.mp3'
    },
    {
      title: 'Collection: In the Arena',
      description: 'On inspiration and iteration. Welcome back to the show. I\'ve pulled out some thoughts from the past year, and we\'re just going to go through them.',
      duration: '06:23',
      date: 'Oct 14 2025',
      link: '#',
      audio: '/goodness.mp3'
    },
    {
      title: 'Find the Simplest Thing That Works',
      description: 'We\'ve all seen the pictures of great engineering feats. When you look at the various iterations, they go from easy-to-vary to hard-to-vary.',
      duration: '06:23',
      date: 'Oct 1 2025',
      link: '#',
      audio: '/goodness.mp3'
    },
    {
      title: 'Good Products Are Hard to Vary',
      description: 'I think reading across all the different disciplines is very useful. Even when topics seem separate, they cross over into philosophy, theory, and practice.',
      duration: '06:23',
      date: 'Sep 29 2025',
      link: '#',
      audio: '/goodness.mp3'
    },
    {
      title: 'Most Books Should Be Skimmed',
      description: 'For knowledge and philosophy, you can skip everything and jump straight to the best sources. If you just want to know a subject, read the masters.',
      duration: '06:23',
      date: 'Sep 26 2025',
      link: '#',
      audio: '/goodness.mp3'
    },
    {
      title: 'The Best Work Respects Your Time',
      description: 'Unlike verbose writers, great communicators design for the masses. People read the classics but don\'t always get value from them.',
      duration: '06:23',
      date: 'Sep 24 2025',
      link: '#',
      audio: '/goodness.mp3'
    }
  ]
</script>


<Header brand="UnkleAyo" />

<main class="app-main">
  {#if currentPage === 'home'}
    <div class="content-container">
      <section class="hero">
        <nav class="additional-links">
          <a href="#archive">YouTube</a>
          <a href="https://www.linkedin.com/in/unkleayo/" target="_blank">LinkedIn</a>
          <a href="#subscribe">E-mail</a>
        </nav>
      </section>

      <section class="episodes-list">
        {#each episodes as ep}
          <ContentCard
            title={ep.title}
            description={ep.description}
            category={ep.category}
            duration={ep.duration}
            date={ep.date}
            link={ep.link}
            audio={ep.audio}
          />
        {/each}
      </section>
    </div>
    <Footer />
  {:else if currentPage === 'subscribe'}
    <Subscribe />
  {:else if currentPage === 'archive'}
    <Archive />
  {/if}
</main>

