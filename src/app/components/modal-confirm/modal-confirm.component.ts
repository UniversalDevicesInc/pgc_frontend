import { Component, OnInit, Input } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'

@Component({
  selector: 'app-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.css']
})
export class ModalConfirmComponent implements OnInit {
  @Input() title
  @Input() body

  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit() {
  }

  cancel() {
    this.activeModal.close(false)
  }

  confirm() {
    this.activeModal.close(true)
  }

}
