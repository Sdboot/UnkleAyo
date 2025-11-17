<script>
  const topPosts = [
    { title: 'How to Get Rich', link: '#' },
    { title: 'Collection: In the Arena', link: '#' },
    { title: 'Curate People', link: '#' },
    { title: 'Find the Simplest Thing That Works', link: '#' },
    { title: 'Most Books Should Be Skimmed, A Few Should Be Devoured', link: '#' }
  ]

  const archiveByYear = {
   
  }

  const categories = [
    'Bubble',
    'Classifieds',
    'Crypto',
    'Happiness',
    'Interviews',
    'Jobs',
    'Podcast',
    'Politics',
    'Quotes',
    'Science',
    'Search',
    'Startups',
    'Stories',
    'Sundry',
    'Technology',
    'Uncategorized',
    'Venture Capital',
    'Wealth'
  ]
</script>

<section class="archive-container">
  <div class="archive-inner">
    <h1>Archive</h1>

    <section class="top-posts">
      <h2>Top Posts</h2>
      <ul>
        {#each topPosts as post}
          <li><a href={post.link}>{post.title}</a></li>
        {/each}
      </ul>
    </section>

    <section class="archive-by-year">
      {#each Object.entries(archiveByYear) as [year, posts]}
        <div class="year-section">
          <h2>{year}</h2>
          <ul>
            {#each posts as post}
              <li><a href={post.link}>{post.title}</a></li>
            {/each}
          </ul>
        </div>
      {/each}
    </section>

    <section class="categories">
      <h2>Categories</h2>
      <ul>
        {#each categories as category}
          <li><a href="#">{category}</a></li>
        {/each}
      </ul>
    </section>
  </div>
</section>

<style>
  .archive-container {
    min-height: calc(100vh - 64px);
    padding: 40px 24px;
    margin-top: 64px;
  }

  .archive-inner {
    max-width: 900px;
    margin: 0 auto;
  }

  h1 {
    font-size: 48px;
    margin: 0 0 40px 0;
    font-weight: 700;
  }

  h2 {
    font-size: 20px;
    margin: 32px 0 16px 0;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  li {
    margin: 0;
  }

  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s;
  }

  a:hover {
    color: #efefef;
    text-decoration: underline;
  }

  .year-section {
    margin-bottom: 32px;
  }

  .categories {
    margin-top: 40px;
    padding-top: 32px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .categories ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  @media (max-width: 640px) {
    .archive-container {
      padding: 24px 16px;
    }

    h1 {
      font-size: 36px;
      margin-bottom: 32px;
    }

    h2 {
      font-size: 18px;
    }

    .categories ul {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
