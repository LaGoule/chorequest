// Icônes SVG pour l'application

// Les icônes SVG communes
export const icons = {
  // Icônes de catégories
  categoryIcons: {
    cleaning: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M80,216A12,12,0,0,1,68,204V68.56a36.05,36.05,0,0,1,72.1,0V76h16V56a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V76h8a8,8,0,0,1,0,16H212v48a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V92H136v76c0,.2,0,.4,0,.6A48,48,0,0,1,92.34,216Zm16-147.44a20,20,0,0,0,28,18.31V68.56a20.06,20.06,0,0,0-28-18.31ZM168,64h32V56H168Zm0,48h24V96H168ZM92,140h8a8,8,0,0,0,0-16H92a8,8,0,0,0,0,16Z"></path></svg>`,
    cooking: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M232,96H217.38l-4.92-19.64A16,16,0,0,0,196.83,64H59.18A16,16,0,0,0,43.54,76.37L38.63,96H24a8,8,0,0,0,0,16h4.58l8.21,80A24,24,0,0,0,60.68,216H195.31a24,24,0,0,0,23.89-24l8.21-80H232a8,8,0,0,0,0-16ZM59.18,80h137.65l4,16H55.16ZM204,190.9a8,8,0,0,1-8.69,9.1H60.68a8,8,0,0,1-7.95-7.17L44.91,112H211.09ZM152,144a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,144Z"></path></svg>`,
    maintenance: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M226.76,69.66,186.34,29.24a16,16,0,0,0-22.63,0L149,44a8,8,0,0,0,0,11.31l51.67,51.67a8,8,0,0,0,11.31,0l14.74-14.74A16,16,0,0,0,226.76,69.66Zm-11.31,11.31L200.7,95.72,160.28,55.3,175,40.55,215.45,81ZM96,187.64a8.08,8.08,0,0,1-2.23,5.16l-28,27.8c-5.78,5.71-14.09,7.34-21.46,4.17l-17.41-7.5a8,8,0,0,1-4.25-10.52l7.48-17.4c3.19-7.39,10.74-12.35,18.75-12.35l-.32-13h0a32.49,32.49,0,0,0-29.69,20L11.07,202a24,24,0,0,0,12.71,31.48l17.41,7.5a32,32,0,0,0,12.75,2.66,31.76,31.76,0,0,0,22.56-9.34l28-27.8A24,24,0,0,0,112,178.55v-7A32.11,32.11,0,0,0,96,177.23Zm72-40H65.49l37.2-37.21a8,8,0,0,0-11.32-11.32L39.16,151.32A16,16,0,0,0,34.27,162,16.15,16.15,0,0,0,39,176a16,16,0,0,0,12,5.22H168a8,8,0,0,0,0-16h0a24,24,0,0,1,0-48h0a8,8,0,0,0,0-16h0a40,40,0,0,0,0,80Z"></path></svg>`,
    outdoor: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M200.77,53.89A8,8,0,0,0,192,56H168V88h32a8,8,0,0,0,8-8V64A8,8,0,0,0,200.77,53.89ZM96,56a8,8,0,0,0-16,0v72a8,8,0,0,0,16,0Zm64,152a8,8,0,0,0,8-8V168h16a8,8,0,0,0,8-8,96,96,0,0,0-107.52-95.36,8,8,0,0,0-7,10.55l36.3,90.75L98.64,189.65a8,8,0,0,0,14.08,7.52l20.3-30.44,19.07,26.7A8,8,0,0,0,160,200ZM174.86,152H160a8,8,0,0,0-8,8v21.53L134.92,157a8,8,0,0,0-13.42,1l-35.5-88.74A80,80,0,0,1,174.86,152Z"></path></svg>`,
    shopping: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M100,156a12,12,0,1,1-12-12A12,12,0,0,1,100,156Zm68-12a12,12,0,1,0,12,12A12,12,0,0,0,168,144ZM92,52H204.7L182,119.11a16,16,0,0,1-15,10.89H96.25A16.1,16.1,0,0,1,80.5,118.76L44,52H36a8,8,0,0,1,0-16H44A16,16,0,0,1,58,44.25L67.69,60H216a8,8,0,0,1,7.43,11l-28,80A24,24,0,0,1,172.94,168a24,24,0,0,1-41.88,0H125.94a24,24,0,0,1-41.88,0H76a8,8,0,0,1,0-16h8.06a24,24,0,0,1,44.59,0h5.29a23.93,23.93,0,0,1,17-18.23l-8-19.57A8.22,8.22,0,0,1,136,108a8,8,0,0,1,7.39,11.07l5.78,14.09A23.87,23.87,0,0,1,156,136h16.94a23.95,23.95,0,0,1,16.47-10.61L211.73,60H73.88Z"></path></svg>`,
    default: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path></svg>`
  },

  // Icônes d'action
  actions: {
    add: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32A8,8,0,0,1,176,128Z"></path></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>`,
    details: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"></path></svg>`,
    expand: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>`,
    collapse: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M184.5,136.11a8,8,0,0,1,0,11.31l-53.66,53.66a8,8,0,0,1-5.65,2.34,8.08,8.08,0,0,1-5.66-2.34L65.87,147.42A8,8,0,0,1,77.18,136.1l47.15,47.14,47.14-47.13A8,8,0,0,1,184.5,136.11ZM77.18,93a8,8,0,0,0,0,11.31l47.15,47.14,47.14-47.13a8,8,0,0,0-11.32-11.32L128,125.16,95.82,93A8,8,0,0,0,77.18,93Z"></path></svg>`,
    sort: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M128,128a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16h72A8,8,0,0,1,128,128ZM48,72H208a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16Zm112,112H48a8,8,0,0,0,0,16H160a8,8,0,0,0,0-16Z"></path></svg>`,
    filter: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V200a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,178.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM144,173.25,120,189.84V136H104v53.84L80,173.25V132.61L40.78,90.28,29.51,78H226.49l-11.26,12.28L176,132.61Z"></path></svg>`,
    grid: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,80H136V56h64Zm-80,16v64H56V136Zm-64-16V56h64v64Zm144,80H136V136h64Z"></path></svg>`,
    list: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path></svg>`,
    category: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40H72A16,16,0,0,0,56,56V72H40A16,16,0,0,0,24,88V200a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V184h16a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM184,200H40V88H184Zm32-32H200V88a16,16,0,0,0-16-16H72V56H216Z"></path></svg>`,
    kanban: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM112,208H48V48h64Zm96,0H128V48h80Z"></path></svg>`
  }
};

// Fonctions utilitaires pour obtenir les icônes
export function getCategoryIcon(category) {
  return icons.categoryIcons[category] || icons.categoryIcons.default;
}

export function getActionIcon(action) {
  return icons.actions[action] || '';
}

// Pour la compatibilité avec les classes CSS
export const taskViewIcons = {
  grid: 'task-view-icon-grid',
  list: 'task-view-icon-list',
  category: 'task-view-icon-category',
  kanban: 'task-view-icon-kanban'
};

export const actionIcons = {
  add: 'task-action-icon-add',
  complete: 'task-action-icon-complete',
  details: 'task-action-icon-details',
  expand: 'task-action-icon-expand',
  collapse: 'task-action-icon-collapse',
  sort: 'task-action-icon-sort',
  filter: 'task-action-icon-filter',
  edit: 'task-action-icon-edit',
  delete: 'task-action-icon-delete',
  cancel: 'task-action-icon-cancel',
  save: 'task-action-icon-save'
};
