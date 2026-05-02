import '@testing-library/jest-dom';

// jsdom does not implement scrollIntoView or focus with options — mock them globally
window.HTMLElement.prototype.scrollIntoView = () => {};
window.HTMLElement.prototype.focus = function () {};
