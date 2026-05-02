import { computed, Directive, input, signal } from '@angular/core';

@Directive({
  selector: '[dragDropHandler]',
  exportAs: 'dragDropHandler',
  host: {
    '(drop)': 'onDrop($event)',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '[class.is-dragging]': 'isDragging()',
  },
})
export class DragDropHandler {
  dropDisabled = input(false);

  _isDragging = signal(false);
  isDragging = computed(() => (this.dropDisabled() ? false : this._isDragging()));

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!this._isDragging()) {
      this._isDragging.set(true);
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this._isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this._isDragging.set(false);
  }
}
