<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-section">
      <h3>UnkleAyo</h3>
      <ul>
        <li><a href="#archive">Archive</a></li>
        <li><a href="#schedule">Schedule Meeting</a></li>
        <li><a href="https://selar.com/m/salakoayomide" target="_blank">Store</a></li>
        <li><a href="https://www.instagram.com/unkleayo/">Contact</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h3>Follow</h3>
      <ul>
        <li><a href="https://x.com/UnkleAyo" target="_blank">Twitter</a></li>
        <li><a href="https://www.instagram.com/unkleayo/" target="_blank">Instagram</a></li>
        <li><a href="https://www.linkedin.com/in/unkleayo/" target="_blank">LinkedIn</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h3>Listen</h3>
      <ul>
        <li><a href="#apple">Apple Podcasts</a></li>
        <li><a href="#spotify">Spotify</a></li>
        <li><a href="#https://www.youtube.com/@unkleayo">YouTube</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h3>Newsletter</h3>
      <ul>
        <li><a href="#subscribe">Subscribe</a></li>
        <li><a href="#unsubscribe">Unsubscribe</a></li>
      </ul>
    </div>
  </div>

  <div class="footer-bottom">
    <p>&copy; 2025 UnkleAyo. All rights reserved.</p>
  </div>
</footer>

<style>
  .site-footer {
    background: linear-gradient(180deg, #070707 0%, #0a0a0a 100%);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: #efefef;
    padding-top: 48px;
    padding-bottom: 24px;
  }

  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 32px;
    margin-bottom: 32px;
  }

  .footer-section h3 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color:  #ff6b35;
  }

  .footer-section ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .footer-section a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s;
  }

  .footer-section a:hover {
    color: #efefef;
  }

  .footer-bottom {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 24px 0 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .footer-bottom p {
    margin: 0;
  }

  @media (max-width: 640px) {
    .footer-inner {
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 0 16px;
    }

    .footer-section h3 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color:  #ff6b35;
  }
    .footer-bottom {
      padding: 16px 16px 0 16px;
    }
  }
</style>
