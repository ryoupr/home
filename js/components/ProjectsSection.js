/**
 * ProjectsSection Component
 * Manages the projects section and renders project cards in a grid layout
 * Uses Tailwind CSS utility classes for responsive grid layout
 */

class ProjectsSection {
  /**
   * Create a ProjectsSection instance
   * @param {string} containerId - ID of the container element
   * @param {Array<Object>} projectsData - Array of project data objects
   */
  constructor(containerId, projectsData) {
    this.container = document.getElementById(containerId);
    this.projectsData = projectsData || [];
    
    if (!this.container) {
      console.error(`Container with ID "${containerId}" not found`);
    }
  }

  /**
   * Render all project cards to the grid
   * Creates a ProjectCard instance for each project and appends to the grid
   */
  render() {
    if (!this.container) {
      console.error('Cannot render: container not found');
      return;
    }

    // Clear existing content
    this.container.innerHTML = '';

    // Validate projects data
    if (!Array.isArray(this.projectsData) || this.projectsData.length === 0) {
      console.warn('No projects data to render');
      this.container.innerHTML = '<p class="text-center text-gray-600 col-span-full">プロジェクトがありません。</p>';
      return;
    }

    // Render each project card
    this.projectsData.forEach(projectData => {
      // Validate required fields
      if (!this.isValidProject(projectData)) {
        console.warn('Skipping invalid project:', projectData);
        return;
      }

      const card = new ProjectCard(projectData);
      this.container.innerHTML += card.render();
    });

    console.log(`Rendered ${this.projectsData.length} project cards`);

    // Re-initialize scroll animations for newly added project cards
    // Wait for next frame to ensure DOM is updated
    requestAnimationFrame(() => {
      if (window.ScrollAnimations) {
        const scrollAnimations = new window.ScrollAnimations();
        scrollAnimations.init();
      }
    });
  }

  /**
   * Validate project data has required fields
   * @param {Object} project - Project data object
   * @returns {boolean} True if project has all required fields
   */
  isValidProject(project) {
    return (
      project &&
      typeof project.id === 'string' &&
      typeof project.title === 'string' &&
      typeof project.description === 'string' &&
      typeof project.image === 'string'
    );
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProjectsSection };
}
