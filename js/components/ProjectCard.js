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
      <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group" data-animate aria-labelledby="project-title-${this.id}">
        <div class="relative overflow-hidden">
          <img 
            src="${this.image}" 
            alt="${this.escapeHtml(this.title)} - Project screenshot" 
            class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300" 
            loading="lazy"
            onerror="this.src='images/projects/placeholder.svg'; this.alt='Project image not available';"
          />
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100" aria-hidden="true">
            ${linksHTML}
          </div>
        </div>
        <div class="p-6">
          <h3 id="project-title-${this.id}" class="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight">${this.escapeHtml(this.title)}</h3>
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
      .map(tag => `<span class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full" role="listitem">${this.escapeHtml(tag)}</span>`)
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
          class="bg-white text-gray-900 px-4 py-2 rounded-lg mx-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
          class="bg-blue-600 text-white px-4 py-2 rounded-lg mx-2 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
          class="bg-green-600 text-white px-4 py-2 rounded-lg mx-2 hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
