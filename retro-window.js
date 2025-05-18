// retro-window.js

class RetroWindow extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="retro-window.css" />
      <div class="retro-window">
        <div class="titlebar">
          <div class="title">${this.getAttribute('title') || 'Window'}</div>
          <div class="buttons">
            <button class="minimize" title="Minimize">−</button>
            <button class="maximize" title="Maximize">□</button>
            <button class="close" title="Close">×</button>
          </div>
        </div>
        <div class="content">
          <slot></slot>
        </div>
        <div class="resize-handle"></div>
      </div>
    `;

    this.window = this.shadowRoot.querySelector('.retro-window');
    this.titlebar = this.shadowRoot.querySelector('.titlebar');
    this.minimizeBtn = this.shadowRoot.querySelector('.minimize');
    this.maximizeBtn = this.shadowRoot.querySelector('.maximize');
    this.closeBtn = this.shadowRoot.querySelector('.close');
    this.resizeHandle = this.shadowRoot.querySelector('.resize-handle');
    this.content = this.shadowRoot.querySelector('.content');

    this.isMaximized = false;

    this.dragData = { dragging: false, offsetX: 0, offsetY: 0 };
    this.resizeData = { resizing: false, startX: 0, startY: 0, startWidth: 0, startHeight: 0 };

    this._initEvents();
  }

  _initEvents() {
    // Dragging
    this.titlebar.addEventListener('mousedown', e => this._startDrag(e));
    window.addEventListener('mousemove', e => this._onDrag(e));
    window.addEventListener('mouseup', e => this._stopDrag(e));

    // Resizing
    this.resizeHandle.addEventListener('mousedown', e => this._startResize(e));
    window.addEventListener('mousemove', e => this._onResize(e));
    window.addEventListener('mouseup', e => this._stopResize(e));

    // Buttons
    this.minimizeBtn.addEventListener('click', () => this._minimize());
    this.maximizeBtn.addEventListener('click', () => this._toggleMaximize());
    this.closeBtn.addEventListener('click', () => this._close());
  }

  _startDrag(e) {
    this.dragData.dragging = true;
    const rect = this.window.getBoundingClientRect();
    this.dragData.offsetX = e.clientX - rect.left;
    this.dragData.offsetY = e.clientY - rect.top;
    e.preventDefault();
  }

  _onDrag(e) {
    if (!this.dragData.dragging || this.isMaximized) return;
    this.window.style.left = (e.clientX - this.dragData.offsetX) + 'px';
    this.window.style.top = (e.clientY - this.dragData.offsetY) + 'px';
  }

  _stopDrag(e) {
    this.dragData.dragging = false;
  }

  _startResize(e) {
    this.resizeData.resizing = true;
    const rect = this.window.getBoundingClientRect();
    this.resizeData.startX = e.clientX;
    this.resizeData.startY = e.clientY;
    this.resizeData.startWidth = rect.width;
    this.resizeData.startHeight = rect.height;
    e.preventDefault();
  }

  _onResize(e) {
    if (!this.resizeData.resizing || this.isMaximized) return;
    const dx = e.clientX - this.resizeData.startX;
    const dy = e.clientY - this.resizeData.startY;
    this.window.style.width = (this.resizeData.startWidth + dx) + 'px';
    this.window.style.height = (this.resizeData.startHeight + dy) + 'px';
  }

  _stopResize(e) {
    this.resizeData.resizing = false;
  }

  _minimize() {
    if(this.content.style.display !== 'none'){
      this.content.style.display = 'none';
      this.resizeHandle.style.display = 'none';
      this.window.style.height = 'auto';
    } else {
      this.content.style.display = '';
      this.resizeHandle.style.display = '';
      this.window.style.height = '300px';
    }
  }

  _toggleMaximize() {
    if (!this.isMaximized) {
      this._prevStyle = {
        left: this.window.style.left,
        top: this.window.style.top,
        width: this.window.style.width,
        height: this.window.style.height,
      };
      this.window.style.left = '0';
      this.window.style.top = '0';
      this.window.style.width = '100vw';
      this.window.style.height = '100vh';
      this.isMaximized = true;
    } else {
      this.window.style.left = this._prevStyle.left;
      this.window.style.top = this._prevStyle.top;
      this.window.style.width = this._prevStyle.width;
      this.window.style.height = this._prevStyle.height;
      this.isMaximized = false;
    }
  }

  _close() {
    this.remove();
  }
}

customElements.define('retro-window', RetroWindow);
