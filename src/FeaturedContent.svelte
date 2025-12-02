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
    <div class="card-title">Podcast</div>
    <img src="/UnkleAyo.jpeg" alt="Podcast Cover" class="cover-image" />
    <div class="card-note">Listen to conversations about culture, recruiting and success</div>
    <div class="view-all-btn">View All Podcast →</div>
  </button>

  <!-- Featured Newsletter Card -->
  <button class="featured-section newsletter-card" on:click={() => goToContent('newsletter')}>
    <div class="card-title">Newsletter</div>
    <img src="/UnkleAyo.jpeg" alt="Newsletter Cover" class="cover-image" />
    <div class="card-note">Weekly insights on principles of success</div>
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
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(247, 147, 30, 0.04) 100%);
    border: 1px solid rgba(255, 107, 53, 0.15);
    padding: 20px;
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
    text-align: center;
    font-family: inherit;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .featured-section:hover {
    border-color: rgba(255, 107, 53, 0.3);
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.12) 0%, rgba(247, 147, 30, 0.08) 100%);
    transform: translateY(-4px);
  }

  .featured-section:active {
    transform: translateY(-2px);
  }

  .card-title {
    font-size: 18px;
    font-weight: 700;
    color: #ff6b35;
    margin: 0;
    text-transform: capitalize;
    letter-spacing: 0.5px;
  }

  .cover-image {
    width: 100%;
    height: 280px;
    object-fit: cover;
    border-radius: 8px;
    transition: transform 0.3s ease;
  }

  .featured-section:hover .cover-image {
    transform: scale(1.02);
  }

  .card-note {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.65);
    margin: 0;
    line-height: 1.5;
  }

  .view-all-btn {
    padding: 12px 20px;
    background: rgba(255, 107, 53, 0.15);
    border: 2px solid rgba(255, 107, 53, 0.3);
    border-radius: 6px;
    color: #ff6b35;
    font-size: 14px;
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

    .featured-section {
      padding: 16px;
    }

    .cover-image {
      height: 250px;
    }

    .card-title {
      font-size: 16px;
    }

    .card-note {
      font-size: 11px;
    }

    .view-all-btn {
      font-size: 13px;
      padding: 10px 16px;
    }
  }
</style>
