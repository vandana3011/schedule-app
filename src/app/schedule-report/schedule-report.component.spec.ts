import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleReportComponent } from './schedule-report.component';

describe('ScheduleReportComponent', () => {
  let component: ScheduleReportComponent;
  let fixture: ComponentFixture<ScheduleReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
