/**
 * ProjectCard Component
 * Renders a project card with image, title, description, tags, and links
 * Uses Tailwind CSS utility classes for styling
 */

class ProjectCard {
  /**
   * Create a ProjectCard instance
   * @param {Object} data - Project data object
   * @param {string} data.id - Unique project identifier
   * @param {string} data.title - Project title
   * @param {string} data.description - Project description
   * @param {string} data.image - Path to project image
   * @param {string[]} data.tags - Array of technology tags
   * @param {Object} data.links - Object containing project links
   * @param {string} data.links.github - GitHub repository URL
   * @param {string} data.links.demo - Live demo URL
   * @param {string|null} data.links.website - Optional website URL
   */
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.image = data.image;
    this.tags = data.tags || [];
    this.links = data.links || {};
  }

  /**
   * Render the project card HTML
   * @returns {string} HTML string for the project card
   */
  render() {
    const tagsHTML = this.renderTags();
    const linksHTML = this.renderLinks();

    return `
      <article class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-500 group border border-gray-100 hover:border-blue-200 hover:-translate-y-2" data-animate aria-labelledby="project-title-${this.id}">
        <div class="relative overflow-hidden h-56">
          <img 
            src="${this.image}" 
            alt="${this.escapeHtml(this.title)} - Project screenshot" 
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            loading="lazy"
            onerror="this.src='images/projects/placeholder.svg'; this.alt='Project image not available';"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center" aria-hidden="true">
            ${linksHTML}
          </div>
        </div>
        <div class="p-6">
          <h3 id="project-title-${this.id}" class="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">${this.escapeHtml(this.title)}</h3>
          <p class="text-gray-600 mb-4 leading-relaxed text-base">${this.escapeHtml(this.description)}</p>
          <div class="flex flex-wrap gap-2" role="list" aria-label="Technologies used">
            ${tagsHTML}
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Render technology tags
   * @returns {string} HTML string for tags
   */
  renderTags() {
    return this.tags
      .map(tag => `<span class="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium" role="listitem">${this.escapeHtml(tag)}</span>`)
      .join('');
  }

  /**
   * Render project links (GitHub, Demo, Website)
   * @returns {string} HTML string for links
   */
  renderLinks() {
    const links = [];

    if (this.links.github) {
      links.push(`
        <a 
          href="${this.escapeHtml(this.links.github)}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="bg-white/90 backdrop-blur-sm text-gray-900 px-5 py-2.5 rounded-full mx-2 hover:bg-white transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="View ${this.escapeHtml(this.title)} code on GitHub"
        >
          View Code
        </a>
      `);
    }

    if (this.links.demo) {
      links.push(`
        <a 
          href="${this.escapeHtml(this.links.demo)}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-full mx-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="View ${this.escapeHtml(this.title)} live demo"
        >
          Live Demo
        </a>
      `);
    }

    if (this.links.website) {
      links.push(`
        <a 
          href="${this.escapeHtml(this.links.website)}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-full mx-2 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Visit ${this.escapeHtml(this.title)} website"
        >
          Website
        </a>
      `);
    }

    return links.join('');
  }

  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProjectCard };
}
