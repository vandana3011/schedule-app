import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs'; // Tabs module
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';


@Component({
  selector: 'app-schedule-report',
  templateUrl: './schedule-report.component.html',
  styleUrls: ['./schedule-report.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatCardModule
  ]
})
export class ScheduleReportComponent {
  scheduleForm: FormGroup;
  selectedTab = 0;
  cronExpression: string = '';
  generatedData: any = null; // Store generated data (includes cron)
  monthNumbers = [1, 2, 3, 4, 6];  //Only return selected months

  today: string = new Date().toISOString().split('T')[0];

  reportTypes = [
    { id: 1, label: 'Report-A' },
    { id: 2, label: 'Report-B' },
    { id: 3, label: 'Report-C' }
  ];

  weekDays = [
    { id: 0, label: 'Sunday' },
    { id: 1, label: 'Monday' },
    { id: 2, label: 'Tuesday' },
    { id: 3, label: 'Wednesday' },
    { id: 4, label: 'Thursday' },
    { id: 5, label: 'Friday' },
    { id: 6, label: 'Saturday' }
  ];

  weekOccurrences = [
    { id: 1, label: 'First' },
    { id: 2, label: 'Second' },
    { id: 3, label: 'Third' },
    { id: 4, label: 'Fourth' },
    { id: 5, label: 'Last' }
  ];

  constructor(private fb: FormBuilder) {
    this.scheduleForm = this.fb.group({
      reportType: [null, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],

      // Daily Tab
      dailyType: [1, Validators.required],  // Default: "Every Day" (1)
      dailyInterval: [1, [Validators.required, Validators.min(1)]],

      // Weekly Tab
      daysOfWeek: [[]],

      // Monthly Tab
      monthlyType: [2, Validators.required], // Default to "Specific Weekday"
      dayOfMonth: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      monthInterval: [this.monthNumbers[0], [Validators.required]],

      weekOccurrence: [this.weekOccurrences[0].id], // Default "First"
      weekDay: [this.weekDays[0].id], // Default "Sunday"
      weekMonthInterval: [this.monthNumbers[0], [Validators.required]],
      selectedTime: ['00:00', [Validators.required]]  // Default time set to midnight
    });

  }
  onTabChange(index: number) {
    this.selectedTab = index;
    this.generatedData = null; // Reset JSON on tab switch
    this.cronExpression = '';
  }
  addDaysOfMonth(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value) {
      this.scheduleForm.patchValue({
        datesOfMonth: value.split(',').map(day => parseInt(day.trim(), 10))
      });
    }
  }


  generateCron() {
    // Trigger validation
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    let cron = '';

    // Get Selected Time (24-hour format)
    let selectedTime = this.scheduleForm.get('selectedTime')?.value || '00:00';

    // Daily Cron (Without Time)
    if (this.selectedTab === 0) {
      cron = this.generateDailyCron(this.scheduleForm.get('dailyType')?.value);

      // Weekly Cron (Without Time)
    } else if (this.selectedTab === 1) {
      cron = this.generateWeeklyCron(this.scheduleForm.get('daysOfWeek')?.value);

      // Monthly Cron (Without Time)
    } else if (this.selectedTab === 2) {
      let monthlyType = parseInt(this.scheduleForm.get('monthlyType')?.value, 10);

      if (monthlyType === 1) {
        cron = this.generateMonthlyCron(
          this.scheduleForm.get('dayOfMonth')?.value,
          this.scheduleForm.get('monthInterval')?.value
        );
      } else {
        let occurrence = this.scheduleForm.get('weekOccurrence')?.value || '1'; // Default to first occurrence
        let day = this.scheduleForm.get('weekDay')?.value;
        let interval = this.scheduleForm.get('weekMonthInterval')?.value;

        cron = this.generateMonthlyWeekdayCron(occurrence, day, interval);
      }
    }

    // Construct final JSON including execution time separately
    this.generatedData = {
      reportType: this.scheduleForm.get('reportType')?.value,
      startDate: this.scheduleForm.get('startDate')?.value,
      endDate: this.scheduleForm.get('endDate')?.value,
      executionTime: selectedTime, 
      cronExpression: cron 
    };

    console.log('Generated Data:', this.generatedData);
  }


  // Generate Cron for Daily Schedule (with Time)
  generateDailyCron(dailyType: number): string {
    return dailyType === 1
      ? `* * * * *`   // Runs every day
      : `* * * * 1-5`; // Runs Monday to Friday
  }


  // Generate Cron for Weekly Schedule (with Time)
  generateWeeklyCron(daysOfWeek: number[]): string {
    if (daysOfWeek.length === 0) return '';

    // Convert from UI-based days (1-7) to Cron-based days (0-6)
    const cronDays = daysOfWeek.map(day => day.toString());

    return `* * * * ${cronDays.join(',')}`; // Runs on selected weekdays
  }


  // Generate Cron for Monthly (Specific Day of Month with Time)
  generateMonthlyCron(day: number, interval: number): string {
    let selectedMonths = [];
    for (let i = 1; i <= 12; i += interval) {
      selectedMonths.push(i);
    }
    return `* * ${day} ${selectedMonths.join(',')} *`;
  }


  // Generate Cron for Monthly Weekday Occurrence (with Time)
  generateMonthlyWeekdayCron(occurrence: string | number, day: string | number, interval: number): string {
    let selectedMonths: number[] = [];

    // Generate correct months (every X months)
    for (let i = 1; i <= 12; i += interval) {
      selectedMonths.push(i);
    }

    // Convert day to string if it's a number
    const dayStr = String(day);

    // Handle "Last Weekday" case
    if (occurrence === 'L' || occurrence === '5') {
      return `* * * ${selectedMonths.join(',')} ${dayStr}L`;
    }

    // Use `#` format for exact "Nth weekday of the month"
    return `* * * ${selectedMonths.join(',')} ${dayStr}#${occurrence}`;
  }




}


