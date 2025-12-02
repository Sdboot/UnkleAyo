<script>
  import Header from './Header.svelte'
  import Footer from './Footer.svelte'

  let menuOpen = false
  let expandedNewsletter = null

  const newsletters = [
    {
      id: 1,
      title: 'Newsletter Issue #1: Principles of Success',
      description: 'Deep dive into timeless principles that drive success in business and life.',
      date: 'Nov 15 2025',
      pdf: '/newsletter-1.pdf'
    },
    {
      id: 2,
      title: 'Newsletter Issue #2: Building Great Team',
      description: 'Strategies for recruiting, onboarding, and maintaining high-performing teams.',
      date: 'Nov 1 2025',
      pdf: '/newsletter-2.pdf'
    },
    {
      id: 3,
      title: 'Newsletter Issue #3: The Art of Communication',
      description: 'How to communicate clearly, concisely, and with impact across all mediums.',
      date: 'Oct 15 2025',
      pdf: '/newsletter-3.pdf'
    },
    {
      id: 4,
      title: 'Newsletter Issue #4: Learning and Growth',
      description: 'Exploring different learning strategies and how to build a personal knowledge base.',
      date: 'Oct 1 2025',
      pdf: '/newsletter-4.pdf'
    }
  ]

  function toggleNewsletter(id) {
    expandedNewsletter = expandedNewsletter === id ? null : id
  }

  function downloadPDF(pdf, title) {
    const a = document.createElement('a')
    a.href = pdf
    a.download = `${title}.pdf`
    a.click()
  }
</script>

<Header brand="UnkleAyo" bind:menuOpen />

<main class="newsletters-main" class:hidden={menuOpen}>
  <div class="newsletters-container">
    <section class="newsletters-header">
      <h1>All Newsletters</h1>
      <p>Explore the complete collection of UnkleAyo newsletters</p>
    </section>

    <section class="newsletters-section">
      <div class="dropdown-list">
        {#each newsletters as newsletter (newsletter.id)}
          <div class="dropdown-item">
            <button
              class="dropdown-header"
              on:click={() => toggleNewsletter(newsletter.id)}
            >
              <span class="dropdown-toggle">
                {expandedNewsletter === newsletter.id ? '▼' : '▶'}
              </span>
              <div class="dropdown-title-meta">
                <span class="dropdown-title">{newsletter.title}</span>
                <span class="dropdown-meta">{newsletter.date}</span>
              </div>
            </button>
            {#if expandedNewsletter === newsletter.id}
              <div class="dropdown-content">
                <p class="content-description">{newsletter.description}</p>
                <div class="content-actions">
                  <button class="action-btn download-btn" on:click={() => downloadPDF(newsletter.pdf, newsletter.title)}>
                    ⬇ Download PDF
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  </div>

  <Footer />
</main>

<style>
  .newsletters-main.hidden {
    display: none;
  }

  .newsletters-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
  }

  .newsletters-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 20px 0;
  }

  .newsletters-header h1 {
    font-size: 36px;
    font-weight: 700;
    color: #efefef;
    margin: 0 0 12px 0;
  }

  .newsletters-header p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  .newsletters-section {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 24px 0;
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
    padding: 10px 16px;
    border-radius: 6px;
    border: 1px solid rgba(255, 107, 53, 0.3);
    background: rgba(255, 107, 53, 0.1);
    color: #ff6b35;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
  }

  .action-btn:hover {
    background: rgba(255, 107, 53, 0.2);
    border-color: rgba(255, 107, 53, 0.6);
    color: #ffb084;
  }

  .download-btn {
    flex: 1;
  }

  @media (max-width: 640px) {
    .newsletters-container {
      padding: 16px;
    }

    .newsletters-header h1 {
      font-size: 28px;
    }

    .newsletters-header p {
      font-size: 14px;
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
  }
</style>
