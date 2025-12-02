<script>
  export let navigateTo

  const latestPodcast = {
    id: 1,
    title: 'Curate People',
    description: 'On recruiting and culture. You\'re listening to the UnkleAyo Show. Today we\'re going to be talking about recruiting, hiring, team, and culture.',
    duration: '06:23',
    date: 'Nov 7 2025',
    audio: '/goodness.mp3'
  }

  const latestNewsletter = {
    id: 1,
    title: 'Newsletter Issue #1: Principles of Success',
    description: 'Deep dive into timeless principles that drive success in business and life.',
    date: 'Nov 15 2025',
    pdf: '/newsletter-1.pdf'
  }

  function goToContent(type) {
    if (type === 'podcast') {
      window.location.hash = 'podcasts'
    } else if (type === 'newsletter') {
      window.location.hash = 'newsletters'
    }
  }

  function downloadAudio() {
    const a = document.createElement('a')
    a.href = latestPodcast.audio
    a.download = `${latestPodcast.title}.mp3`
    a.click()
  }

  function downloadPDF() {
    const a = document.createElement('a')
    a.href = latestNewsletter.pdf
    a.download = `${latestNewsletter.title}.pdf`
    a.click()
  }
</script>

<div class="featured-content">
  <!-- Featured Podcast Card -->
  <button class="featured-section podcast-card" on:click={() => goToContent('podcast')}>
    <div class="card-header">
      <h2 class="card-title">Latest Podcast</h2>
      <span class="card-badge">Featured</span>
    </div>

    <div class="card-content">
      <h3 class="content-title">{latestPodcast.title}</h3>
      <p class="content-meta">{latestPodcast.date} • {latestPodcast.duration}</p>
      <p class="content-description">{latestPodcast.description}</p>

      <div class="audio-player-container" on:click|stopPropagation={() => {}}>
        <audio controls on:click|stopPropagation={() => {}}>
          <source src={latestPodcast.audio} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>

      <div class="card-actions" on:click|stopPropagation={() => {}}>
        <button class="action-btn download-btn" on:click|stopPropagation={downloadAudio}>
          ⬇ Download
        </button>
        <div class="view-all-text">View All Podcasts →</div>
      </div>
    </div>
  </button>

  <!-- Featured Newsletter Card -->
  <button class="featured-section newsletter-card" on:click={() => goToContent('newsletter')}>
    <div class="card-header">
      <h2 class="card-title">Latest Newsletter</h2>
      <span class="card-badge">Featured</span>
    </div>

    <div class="card-content">
      <h3 class="content-title">{latestNewsletter.title}</h3>
      <p class="content-meta">{latestNewsletter.date}</p>
      <p class="content-description">{latestNewsletter.description}</p>

      <div class="card-actions" on:click|stopPropagation={() => {}}>
        <button class="action-btn download-btn" on:click|stopPropagation={downloadPDF}>
          ⬇ Download PDF
        </button>
        <div class="view-all-text">View All Newsletters →</div>
      </div>
    </div>
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
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.05) 100%);
    border: 1px solid rgba(255, 107, 53, 0.2);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s ease;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
  }

  .featured-section:hover {
    border-color: rgba(255, 107, 53, 0.4);
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(247, 147, 30, 0.1) 100%);
    transform: translateY(-4px);
  }

  .featured-section:active {
    transform: translateY(-2px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 20px;
    font-weight: 600;
    color: #efefef;
    margin: 0;
  }

  .card-badge {
    display: inline-block;
    padding: 4px 12px;
    background: rgba(255, 107, 53, 0.2);
    color: #ff6b35;
    font-size: 12px;
    font-weight: 600;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .content-title {
    font-size: 18px;
    font-weight: 600;
    color: #efefef;
    margin: 0;
    line-height: 1.4;
  }

  .content-meta {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  .content-description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 8px 0 0 0;
    line-height: 1.6;
  }

  .audio-player-container {
    margin: 16px 0;
  }

  audio {
    width: 100%;
    height: 32px;
    border-radius: 6px;
  }

  .card-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }

  .view-all-text {
    flex: 1.2;
    padding: 10px 16px;
    border: 1px solid rgba(255, 107, 53, 0.3);
    border-radius: 6px;
    background: rgba(255, 107, 53, 0.1);
    color: #ff6b35;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .action-btn {
    flex: 0.8;
    padding: 10px 16px;
    border: 1px solid rgba(255, 107, 53, 0.3);
    border-radius: 6px;
    background: rgba(255, 107, 53, 0.1);
    color: #ff6b35;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .action-btn:hover {
    background: rgba(255, 107, 53, 0.2);
    border-color: rgba(255, 107, 53, 0.5);
    color: #ffb084;
  }

  .download-btn {
    flex: 0.8;
  }

  @media (max-width: 768px) {
    .featured-content {
      grid-template-columns: 1fr;
      gap: 20px;
      padding: 16px;
    }

    .card-title {
      font-size: 18px;
    }

    .content-title {
      font-size: 16px;
    }

    .card-actions {
      flex-direction: column;
    }

    .action-btn {
      flex: 1;
    }

    .download-btn,
    .view-all-btn {
      flex: 1;
    }
  }
</style>
