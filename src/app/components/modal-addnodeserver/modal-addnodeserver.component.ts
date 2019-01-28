import { Component, OnInit, Input } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'

import { SettingsService } from '../../services/settings.service'

@Component({
  selector: 'app-modal-addnodeserver',
  templateUrl: './modal-addnodeserver.component.html',
  styleUrls: ['./modal-addnodeserver.component.css']
})
export class ModalAddnodeserverComponent implements OnInit {
  @Input() title
  @Input() body
  @Input() environment

  index: Number
  marked = false
  checkBox = false

  constructor(
    public activeModal: NgbActiveModal,
    public settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.index = this.settingsService.availableNodeServerSlots[0]
  }

  cancel() {
    this.activeModal.dismiss()
  }

  confirm() {
    this.activeModal.close({profileNum: this.index, devMode: this.marked})
  }

  onSelect(value) {
    this.index = value
  }

  checked(value) {
    this.marked = value
  }

}
