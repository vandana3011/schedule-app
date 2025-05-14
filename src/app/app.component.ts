import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleReportComponent } from './schedule-report/schedule-report.component';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ Important for standalone mode
  imports: [CommonModule, ScheduleReportComponent], // ✅ Explicitly import the ScheduleReportComponent
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'schedule-app';
}
