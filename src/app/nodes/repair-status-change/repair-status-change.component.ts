import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-repair-status-change',
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule],
  templateUrl: './repair-status-change.component.html',
  styleUrl: './repair-status-change.component.scss'
})
export class RepairStatusChangeComponent {

}
