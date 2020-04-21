import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-end-game',
  templateUrl: './end-game.component.html',
  styleUrls: ['./end-game.component.css'],
})
export class EndGameComponent implements OnInit {
  @Output() endGame = new EventEmitter<void>();

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {}

  openConfirmation() {
    this.modalService.open(EndGameConfirmComponent).result.then(
      (result) => {
        if (result === 'delete') {
          this.endGame.emit();
        }
      },
      (_) => {} // reason
    );
  }
}

@Component({
  selector: 'app-end-game-confirm',
  template: `
    <div class="modal-header">
      <h4 class="modal-title" id="modal-title">Confirm</h4>
      <button
        type="button"
        class="close"
        aria-describedby="modal-title"
        (click)="modal.dismiss('cross click')"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p>
        Are you sure you want to end this game?
      </p>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-outline-secondary"
        (click)="modal.dismiss('cancel')"
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn btn-danger"
        (click)="modal.close('delete')"
      >
        Ok
      </button>
    </div>
  `,
})
export class EndGameConfirmComponent {
  constructor(public modal: NgbActiveModal) {}
}
