import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, CalendarDay } from '../../models/appointment.interface';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="nav-controls">
          <button (click)="previousMonth()" class="nav-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h2 class="month-year">{{ getMonthYear() }}</h2>
          <button (click)="nextMonth()" class="nav-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="view-controls">
          <button (click)="goToToday()" class="today-btn">Today</button>
          <button (click)="switchView('month')" [class.active]="currentView === 'month'" class="view-btn">Month</button>
          <button (click)="switchView('day')" [class.active]="currentView === 'day'" class="view-btn">Day</button>
        </div>
      </div>

      <div class="calendar-grid" *ngIf="currentView === 'month'">
        <div class="weekday-header">
          <div class="weekday" *ngFor="let day of weekDays">{{ day }}</div>
        </div>
        <div class="days-grid">
          <div 
            *ngFor="let day of calendarDays; trackBy: trackByDate"
            class="day-cell"
            [class.other-month]="!day.isCurrentMonth"
            [class.today]="day.isToday"
            [class.selected]="day.isSelected"
            (click)="selectDate(day.date)"
          >
            <div class="day-number">{{ day.date.getDate() }}</div>
            <div class="appointments-preview">
              <div 
                *ngFor="let appointment of day.appointments.slice(0, 3)"
                class="appointment-preview"
                [style.background-color]="appointment.color"
                (click)="$event.stopPropagation(); selectAppointment(appointment)"
              >
                <span class="appointment-title">{{ appointment.title }}</span>
                <span class="appointment-time" *ngIf="!appointment.isAllDay">
                  {{ formatTime(appointment.startTime) }}
                </span>
              </div>
              <div *ngIf="day.appointments.length > 3" class="more-appointments">
                +{{ day.appointments.length - 3 }} more
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="day-view" *ngIf="currentView === 'day'">
        <div class="day-header">
          <h3>{{ selectedDate | date:'fullDate' }}</h3>
          <button (click)="createAppointment()" class="create-btn">+ New Appointment</button>
        </div>
        <div class="time-slots">
          <div 
            *ngFor="let hour of hours"
            class="time-slot"
            [class.has-appointment]="hasAppointmentAtHour(hour)"
          >
            <div class="time-label">{{ formatHour(hour) }}</div>
            <div class="slot-content">
              <div 
                *ngFor="let appointment of getAppointmentsAtHour(hour)"
                class="appointment-block"
                [style.background-color]="appointment.color"
                [style.height.px]="calculateAppointmentHeight(appointment)"
                [style.top.px]="calculateAppointmentTop(appointment)"
                (click)="selectAppointment(appointment)"
              >
                <div class="appointment-info">
                  <div class="appointment-title">{{ appointment.title }}</div>
                  <div class="appointment-time">
                    {{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}
                  </div>
                  <div class="appointment-location" *ngIf="appointment.location">
                    📍 {{ appointment.location }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 0 10px;
    }

    .nav-controls {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
      color: #6b7280;
    }

    .nav-btn:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    .month-year {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .view-controls {
      display: flex;
      gap: 10px;
    }

    .today-btn, .view-btn {
      padding: 8px 16px;
      border: 1px solid #e5e7eb;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      font-weight: 500;
    }

    .today-btn:hover, .view-btn:hover {
      background-color: #f9fafb;
    }

    .view-btn.active {
      background-color: #2563eb;
      color: white;
      border-color: #2563eb;
    }

    .calendar-grid {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .weekday-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background-color: #f8fafc;
      border-bottom: 1px solid #e5e7eb;
    }

    .weekday {
      padding: 16px;
      text-align: center;
      font-weight: 600;
      color: #6b7280;
      font-size: 14px;
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .day-cell {
      min-height: 120px;
      padding: 8px;
      border-right: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .day-cell:hover {
      background-color: #f8fafc;
    }

    .day-cell.other-month {
      color: #9ca3af;
      background-color: #fafafa;
    }

    .day-cell.today {
      background-color: #eff6ff;
    }

    .day-cell.selected {
      background-color: #dbeafe;
      border-color: #3b82f6;
    }

    .day-number {
      font-weight: 600;
      color: #374151;
      margin-bottom: 4px;
    }

    .appointments-preview {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .appointment-preview {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .appointment-preview:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .appointment-title {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .appointment-time {
      font-size: 10px;
      opacity: 0.9;
    }

    .more-appointments {
      font-size: 11px;
      color: #6b7280;
      padding: 2px 6px;
      text-align: center;
    }

    .day-view {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .day-header {
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .day-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
    }

    .create-btn {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .create-btn:hover {
      background-color: #1d4ed8;
    }

    .time-slots {
      max-height: 600px;
      overflow-y: auto;
    }

    .time-slot {
      display: flex;
      border-bottom: 1px solid #f3f4f6;
      min-height: 60px;
      position: relative;
    }

    .time-label {
      width: 80px;
      padding: 12px;
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
      text-align: right;
      background-color: #f8fafc;
      border-right: 1px solid #e5e7eb;
    }

    .slot-content {
      flex: 1;
      position: relative;
      padding: 4px 12px;
    }

    .appointment-block {
      position: absolute;
      left: 12px;
      right: 12px;
      border-radius: 6px;
      padding: 8px 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .appointment-block:hover {
      transform: translateX(2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .appointment-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .appointment-title {
      font-weight: 600;
      font-size: 14px;
    }

    .appointment-time {
      font-size: 12px;
      opacity: 0.9;
    }

    .appointment-location {
      font-size: 11px;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .calendar-header {
        flex-direction: column;
        gap: 15px;
      }

      .day-cell {
        min-height: 80px;
      }

      .appointment-preview {
        font-size: 10px;
      }
    }
  `]
})
export class CalendarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentDate = new Date();
  selectedDate = new Date();
  currentView: 'month' | 'day' = 'month';
  calendarDays: CalendarDay[] = [];
  appointments: Appointment[] = [];
  
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  hours = Array.from({length: 24}, (_, i) => i);

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit() {
    this.appointmentService.getAppointments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(appointments => {
        this.appointments = appointments;
        this.generateCalendarDays();
      });
    
    this.generateCalendarDays();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayAppointments = this.appointmentService.getAppointmentsForDate(currentDate);
      
      days.push({
        date: new Date(currentDate),
        appointments: dayAppointments,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isToday(currentDate),
        isSelected: this.isSameDay(currentDate, this.selectedDate)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.calendarDays = days;
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendarDays();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendarDays();
  }

  goToToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.generateCalendarDays();
  }

  switchView(view: 'month' | 'day') {
    this.currentView = view;
  }

  selectDate(date: Date) {
    this.selectedDate = new Date(date);
    this.generateCalendarDays();
    if (this.currentView === 'month') {
      this.currentView = 'day';
    }
  }

  selectAppointment(appointment: Appointment) {
    console.log('Selected appointment:', appointment);
    // TODO: Open appointment details modal
  }

  createAppointment() {
    console.log('Create new appointment');
    // TODO: Open appointment creation modal
  }

  getMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  formatHour(hour: number): string {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      hour12: true 
    });
  }

  hasAppointmentAtHour(hour: number): boolean {
    const dayAppointments = this.appointmentService.getAppointmentsForDate(this.selectedDate);
    return dayAppointments.some(appointment => 
      appointment.startTime.getHours() === hour || 
      (appointment.startTime.getHours() < hour && appointment.endTime.getHours() > hour)
    );
  }

  getAppointmentsAtHour(hour: number): Appointment[] {
    const dayAppointments = this.appointmentService.getAppointmentsForDate(this.selectedDate);
    return dayAppointments.filter(appointment => 
      appointment.startTime.getHours() === hour
    );
  }

  calculateAppointmentHeight(appointment: Appointment): number {
    const duration = appointment.endTime.getTime() - appointment.startTime.getTime();
    const hours = duration / (1000 * 60 * 60);
    return Math.max(hours * 60, 30); // Minimum 30px height
  }

  calculateAppointmentTop(appointment: Appointment): number {
    const minutes = appointment.startTime.getMinutes();
    return minutes;
  }

  trackByDate(index: number, day: CalendarDay): string {
    return day.date.toISOString();
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}