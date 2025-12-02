<script>
  export let navigateTo

  function goToContent(type) {
    if (type === 'podcast') {
      window.location.hash = 'podcasts'
    } else if (type === 'newsletter') {
      window.location.hash = 'newsletters'
    }
  }
</script>

<div class="featured-content">
  <!-- Featured Podcast Card -->
  <button class="featured-section podcast-card" on:click={() => goToContent('podcast')}>
    <img src="/UnkleAyo.jpeg" alt="Podcast Cover" class="cover-image" />
    <div class="view-all-btn">View All Podcast →</div>
  </button>

  <!-- Featured Newsletter Card -->
  <button class="featured-section newsletter-card" on:click={() => goToContent('newsletter')}>
    <img src="/UnkleAyo.jpeg" alt="Newsletter Cover" class="cover-image" />
    <div class="view-all-btn">View All Newsletter →</div>
  </button>
</div>

<style>
  .featured-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .featured-section {
    background: transparent;
    border: none;
    padding: 0;
    transition: all 0.3s ease;
    cursor: pointer;
    text-align: center;
    font-family: inherit;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .featured-section:hover {
    transform: translateY(-4px);
  }

  .featured-section:active {
    transform: translateY(-2px);
  }

  .cover-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 12px;
    transition: transform 0.3s ease;
  }

  .featured-section:hover .cover-image {
    transform: scale(1.02);
  }

  .view-all-btn {
    padding: 14px 24px;
    background: rgba(255, 107, 53, 0.15);
    border: 2px solid rgba(255, 107, 53, 0.3);
    border-radius: 8px;
    color: #ff6b35;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .featured-section:hover .view-all-btn {
    background: rgba(255, 107, 53, 0.25);
    border-color: rgba(255, 107, 53, 0.5);
    color: #ffb084;
  }

  @media (max-width: 768px) {
    .featured-content {
      grid-template-columns: 1fr;
      gap: 20px;
      padding: 16px;
    }

    .cover-image {
      height: 250px;
    }

    .view-all-btn {
      font-size: 14px;
      padding: 12px 20px;
    }
  }
</style>
