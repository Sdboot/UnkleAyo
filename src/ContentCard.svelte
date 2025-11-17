<script>
  export let title = ''
  export let description = ''
  export let duration = ''
  export let date = ''
  export let link = '#'
  export let category = ''
  export let audio = ''

  let showPlayer = false

  function togglePlayer() {
    showPlayer = !showPlayer
  }
</script>

<article class="content-card">
  <h2 class="card-title">
    <a href={link}>{title}</a>
  </h2>
  {#if description}
    <p class="card-description">{description}</p>
  {/if}
  <div class="card-meta">
    {#if duration}
      <span class="duration">{duration}</span>
    {/if}
    {#if audio}
      <button class="get-podcast" on:click={togglePlayer}>Get podcast</button>
    {/if}
    {#if date}
      <span class="date">{date}</span>
    {/if}
  </div>
  {#if showPlayer && audio}
    <div class="audio-player">
      <audio controls autoplay>
        <source src={audio} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  {/if}
  <a href={link} class="more-link">More →</a>
</article>

<style>
  .content-card {
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: background 0.2s;
  }

  .content-card:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .card-title {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.3;
  }

  .card-title a {
    color: #efefef;
    text-decoration: none;
    transition: color 0.2s;
  }

  .card-title a:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  .card-description {
    margin: 0 0 12px 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    line-height: 1.6;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 12px;
  }

  .duration {
    font-weight: 500;
  }

  .get-podcast {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-size: 12px;
    padding: 4px 8px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    font-family: inherit;
  }

  .get-podcast:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.6);
    color: #efefef;
  }

  .audio-player {
    margin: 12px 0;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  audio {
    width: 100%;
    height: 32px;
    border-radius: 4px;
  }

  .date {
    margin-left: auto;
  }

  .more-link {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-size: 14px;
    transition: opacity 0.2s;
  }

  .more-link:hover {
    opacity: 0.7;
  }

  @media (max-width: 640px) {
    .content-card {
      padding: 16px;
    }

    .card-title {
      font-size: 16px;
    }

    .card-description {
      font-size: 13px;
    }

    .card-meta {
      flex-wrap: wrap;
      gap: 8px;
    }

    .date {
      margin-left: 0;
    }
  }
</style>
