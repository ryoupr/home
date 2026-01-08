// Animations JavaScript - Scroll animations and interactions

/**
 * ScrollAnimations class
 * Uses Intersection Observer API to detect elements entering viewport
 * and applies Tailwind utility classes for animations
 */
class ScrollAnimations {
  constructor() {
    this.observer = null;
    this.animatedElements = document.querySelectorAll('[data-animate]');
  }

  /**
   * Initialize the scroll animation system
   */
  init() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // If user prefers reduced motion, show all elements immediately without animation
      this.animatedElements.forEach(el => {
        el.classList.add('opacity-100', 'translate-y-0');
      });
      return;
    }

    // Check for Intersection Observer support
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements immediately if not supported
      this.animatedElements.forEach(el => {
        el.classList.add('opacity-100', 'translate-y-0');
      });
      return;
    }

    // Configure Intersection Observer options
    const options = {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters viewport
    };

    // Create Intersection Observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Element is entering viewport - add animation classes
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-4');
          
          // Stop observing this element after animation
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    // Set initial state and observe each element
    this.animatedElements.forEach(el => {
      // Set initial hidden state with Tailwind classes
      el.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-700');
      
      // Start observing the element
      this.observer.observe(el);
    });
  }

  /**
   * Cleanup method to disconnect observer
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Make ScrollAnimations available globally
window.ScrollAnimations = ScrollAnimations;

// Initialize scroll animations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const scrollAnimations = new ScrollAnimations();
    scrollAnimations.init();
  });
} else {
  // DOM is already ready
  const scrollAnimations = new ScrollAnimations();
  scrollAnimations.init();
}
