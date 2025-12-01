<script>
  let expandedPodcast = null

  const podcasts = [
    {
      id: 1,
      title: 'Curate People',
      description: 'On recruiting and culture. You\'re listening to the UnkleAyo Show. Today we\'re going to be talking about recruiting, hiring, team, and culture.',
      duration: '06:23',
      date: 'Nov 7 2025',
      audio: '/goodness.mp3'
    },
    {
      id: 2,
      title: 'Collection: In the Arena',
      description: 'On inspiration and iteration. Welcome back to the show. I\'ve pulled out some thoughts from the past year, and we\'re just going to go through them.',
      duration: '06:23',
      date: 'Oct 14 2025',
      audio: '/goodness.mp3'
    },
    {
      id: 3,
      title: 'Find the Simplest Thing That Works',
      description: 'We\'ve all seen the pictures of great engineering feats. When you look at the various iterations, they go from easy-to-vary to hard-to-vary.',
      duration: '06:23',
      date: 'Oct 1 2025',
      audio: '/goodness.mp3'
    },
    {
      id: 4,
      title: 'Good Products Are Hard to Vary',
      description: 'I think reading across all the different disciplines is very useful. Even when topics seem separate, they cross over into philosophy, theory, and practice.',
      duration: '06:23',
      date: 'Sep 29 2025',
      audio: '/goodness.mp3'
    },
    {
      id: 5,
      title: 'Most Books Should Be Skimmed',
      description: 'For knowledge and philosophy, you can skip everything and jump straight to the best sources. If you just want to know a subject, read the masters.',
      duration: '06:23',
      date: 'Sep 26 2025',
      audio: '/goodness.mp3'
    },
    {
      id: 6,
      title: 'The Best Work Respects Your Time',
      description: 'Unlike verbose writers, great communicators design for the masses. People read the classics but don\'t always get value from them.',
      duration: '06:23',
      date: 'Sep 24 2025',
      audio: '/goodness.mp3'
    }
  ]

  function togglePodcast(id) {
    expandedPodcast = expandedPodcast === id ? null : id
  }

  function downloadAudio(audio, title) {
    const a = document.createElement('a')
    a.href = audio
    a.download = `${title}.mp3`
    a.click()
  }
</script>

<div class="podcasts-container">
  <section class="podcasts-section">
    <h1 class="section-title">All Podcasts</h1>
    <div class="dropdown-list">
      {#each podcasts as podcast (podcast.id)}
        <div class="dropdown-item">
          <button
            class="dropdown-header"
            on:click={() => togglePodcast(podcast.id)}
          >
            <span class="dropdown-toggle">
              {expandedPodcast === podcast.id ? '▼' : '▶'}
            </span>
            <div class="dropdown-title-meta">
              <span class="dropdown-title">{podcast.title}</span>
              <span class="dropdown-meta">{podcast.date} • {podcast.duration}</span>
            </div>
          </button>
          {#if expandedPodcast === podcast.id}
            <div class="dropdown-content">
              <p class="content-description">{podcast.description}</p>
              <div class="audio-player-container">
                <audio controls>
                  <source src={podcast.audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div class="content-actions">
                <button class="action-btn download-btn" on:click={() => downloadAudio(podcast.audio, podcast.title)}>
                  ⬇ Download Podcast
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .podcasts-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
    min-height: calc(100vh - 64px);
  }

  .podcasts-section {
    padding: 0;
  }

  .section-title {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 32px;
    color: #efefef;
    text-align: center;
  }

  .dropdown-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .dropdown-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;
    transition: background 0.2s;
  }

  .dropdown-item:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .dropdown-header {
    width: 100%;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: transparent;
    border: none;
    color: #efefef;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    font-size: 14px;
  }

  .dropdown-header:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .dropdown-toggle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    min-width: 12px;
    display: inline-block;
  }

  .dropdown-title-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .dropdown-title {
    font-weight: 600;
    color: #efefef;
    font-size: 16px;
  }

  .dropdown-meta {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .dropdown-content {
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .content-description {
    margin: 0 0 16px 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    line-height: 1.6;
  }

  .content-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .action-btn {
    margin: 20px 0px 2px 0px;
    padding: 6px;
    border-radius: 4px;
    background: transparent;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #efefef;
  }

  .download-btn {
    flex: 1;
  }

  .audio-player-container {
    margin-top: 12px;
  }

  audio {
    width: 100%;
    height: 32px;
    border-radius: 4px;
  }

  @media (max-width: 640px) {
    .podcasts-container {
      padding: 16px;
    }

    .section-title {
      font-size: 24px;
      margin-bottom: 24px;
    }

    .dropdown-header {
      padding: 12px;
      font-size: 13px;
    }

    .dropdown-title {
      font-size: 14px;
    }

    .dropdown-content {
      padding: 12px;
    }

    .content-actions {
      flex-direction: column;
    }

    .action-btn {
      width: 100%;
    }
  }
</style>
