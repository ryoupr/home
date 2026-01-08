// Main JavaScript - Core functionality

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio site loaded');
  
  // Initialize and render projects section
  const projectsSection = new ProjectsSection('projects-grid', projects);
  projectsSection.render();
});

