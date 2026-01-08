// Navigation JavaScript - Navigation and smooth scrolling

/**
 * Navigation class to handle menu interactions, smooth scrolling, and active link highlighting
 */
class Navigation {
  constructor(navElement) {
    this.nav = navElement;
    this.toggle = document.getElementById('nav-toggle');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.links = navElement.querySelectorAll('a[href^="#"]');
    this.sections = [];
    
    // Get all sections that navigation links point to
    this.links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const section = document.querySelector(href);
        if (section) {
          this.sections.push({
            id: href.substring(1),
            element: section,
            link: link
          });
        }
      }
    });
  }
  
  /**
   * Initialize all navigation functionality
   */
  init() {
    this.setupToggle();
    this.setupSmoothScroll();
    this.setupActiveLink();
  }
  
  /**
   * Setup hamburger menu toggle for mobile
   */
  setupToggle() {
    if (!this.toggle || !this.mobileMenu) return;
    
    this.toggle.addEventListener('click', () => {
      // Toggle mobile menu visibility using Tailwind classes
      this.mobileMenu.classList.toggle('hidden');
      
      // Update aria-expanded attribute for accessibility
      const isExpanded = !this.mobileMenu.classList.contains('hidden');
      this.toggle.setAttribute('aria-expanded', isExpanded);
    });
    
    // Close menu when clicking on a link
    this.links.forEach(link => {
      link.addEventListener('click', () => {
        if (!this.mobileMenu.classList.contains('hidden')) {
          this.mobileMenu.classList.add('hidden');
          this.toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target) && !this.mobileMenu.classList.contains('hidden')) {
        this.mobileMenu.classList.add('hidden');
        this.toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  /**
   * Setup smooth scroll behavior for navigation links
   */
  setupSmoothScroll() {
    this.links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Only handle internal links
        if (href && href.startsWith('#')) {
          e.preventDefault();
          
          const targetId = href.substring(1);
          const targetSection = document.getElementById(targetId);
          
          if (targetSection) {
            // Calculate offset for fixed navigation
            const navHeight = this.nav.offsetHeight;
            const targetPosition = targetSection.offsetTop - navHeight;
            
            // Smooth scroll to target
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }
  
  /**
   * Setup active link highlighting based on scroll position
   */
  setupActiveLink() {
    // Throttle scroll event for performance
    let ticking = false;
    
    const updateActiveLink = () => {
      const scrollPosition = window.scrollY + this.nav.offsetHeight + 100;
      
      // Find the current section
      let currentSection = null;
      
      for (let i = this.sections.length - 1; i >= 0; i--) {
        const section = this.sections[i];
        if (section.element.offsetTop <= scrollPosition) {
          currentSection = section;
          break;
        }
      }
      
      // Update active class on links (add text-blue-600 for active state)
      this.links.forEach(link => {
        link.classList.remove('text-blue-600');
        link.classList.add('text-gray-700');
      });
      
      if (currentSection) {
        currentSection.link.classList.remove('text-gray-700');
        currentSection.link.classList.add('text-blue-600');
      }
      
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveLink);
        ticking = true;
      }
    });
    
    // Initial update
    updateActiveLink();
  }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const navElement = document.querySelector('nav[role="navigation"]');
  if (navElement) {
    const navigation = new Navigation(navElement);
    navigation.init();
  }
});
