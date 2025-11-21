<script>
  export let brand = 'UnkleAyo'
  let menuOpen = false

  function toggleMenu() {
    menuOpen = !menuOpen
  }

  function closeMenu() {
    menuOpen = false
  }
</script>

<header class="site-header">
  <div class="header-inner">
    <a href="/" class="brand">{brand}</a>
    <nav class="nav">
      <a href="https://x.com/UnkleAyo" target="_blank">Twitter</a>
      <a href="https://www.instagram.com/unkleayo/" target="_blank">Instagram</a>
      <a href="#archive">Archive</a>
      <a href="#subscribe">Subscribe</a>
    </nav>
    <button class="hamburger" class:open={menuOpen} on:click={toggleMenu} aria-label="Toggle menu">
      {#if menuOpen}
        <span class="cancel">✕</span>
      {:else}
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      {/if}
    </button>
  </div>

  {#if menuOpen}
    <nav class="mobile-nav">
      <a href="https://x.com/UnkleAyo" target="_blank" on:click={closeMenu}>Twitter</a>
      <a href="https://www.instagram.com/unkleayo/" target="_blank" on:click={closeMenu}>Instagram</a>
      <a href="#archive" on:click={closeMenu}>Archive</a>
      <a href="#subscribe" on:click={closeMenu}>Subscribe</a>
    </nav>
  {/if}
</header>

<style>
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  .site-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(11, 11, 11, 0.8);
  }

  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    font-size: 30px;
    font-weight: 700;
    letter-spacing: 2px;
    background: linear-gradient(90deg, #ff6b35, #f7931e, #ffb627, #ff6b35);
    background-size: 1000px 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
    cursor: pointer;
    animation: shimmer 6s infinite, float 3s ease-in-out infinite;
    text-transform: uppercase;
    font-family: 'Courier New', monospace;
    transition: filter 0.3s ease;
  }

  .brand:hover {
    filter: brightness(1.2);
  }

  .nav {
    display: flex;
    gap: 32px;
  }

  .nav a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 16px;
    transition: color 0.2s;
  }

  .nav a:hover {
    color: #efefef;
  }

  .hamburger {
    display: none;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    gap: 5px;
  }

  .hamburger .line {
    width: 24px;
    height: 2px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  .hamburger .cancel {
    font-size: 28px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1;
    display: block;
    transition: color 0.3s ease;
  }

  .hamburger:hover .cancel {
    color: #efefef;
  }

  .mobile-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(11, 11, 11, 0.98);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0;
    z-index: 45;
  }

  .mobile-nav a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 24px;
    padding: 20px 0;
    transition: color 0.2s;
    text-align: center;
  }

  .mobile-nav a:hover {
    color: #efefef;
  }

  @media (max-width: 640px) {
    .header-inner {
      padding: 16px 20px;
    }

    .brand {
      font-size: 18px;
    }

    .nav {
      display: none;
    }

    .hamburger {
      display: flex;
    }
  }
</style>
