import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairStatusChangeComponent } from './repair-status-change.component';

describe('RepairStatusChangeComponent', () => {
  let component: RepairStatusChangeComponent;
  let fixture: ComponentFixture<RepairStatusChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepairStatusChangeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RepairStatusChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
