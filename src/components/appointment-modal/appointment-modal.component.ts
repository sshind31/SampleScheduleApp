import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Appointment } from '../../models/appointment.interface';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ editingAppointment ? 'Edit' : 'Create' }} Appointment</h2>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        
        <form class="appointment-form" (ngSubmit)="saveAppointment()">
          <div class="form-group">
            <label for="title">Title *</label>
            <input 
              type="text" 
              id="title" 
              [(ngModel)]="formData.title" 
              name="title"
              required
              placeholder="Enter appointment title"
            >
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description" 
              [(ngModel)]="formData.description" 
              name="description"
              rows="3"
              placeholder="Enter appointment description"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Start Date *</label>
              <input 
                type="date" 
                id="startDate" 
                [(ngModel)]="formData.startDate" 
                name="startDate"
                required
              >
            </div>

            <div class="form-group" *ngIf="!formData.isAllDay">
              <label for="startTime">Start Time *</label>
              <input 
                type="time" 
                id="startTime" 
                [(ngModel)]="formData.startTime" 
                name="startTime"
                required
              >
            </div>
          </div>

          <div class="form-row" *ngIf="!formData.isAllDay">
            <div class="form-group">
              <label for="endDate">End Date *</label>
              <input 
                type="date" 
                id="endDate" 
                [(ngModel)]="formData.endDate" 
                name="endDate"
                required
              >
            </div>

            <div class="form-group">
              <label for="endTime">End Time *</label>
              <input 
                type="time" 
                id="endTime" 
                [(ngModel)]="formData.endTime" 
                name="endTime"
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [(ngModel)]="formData.isAllDay" 
                name="isAllDay"
                (change)="onAllDayChange()"
              >
              <span class="checkmark"></span>
              All Day Event
            </label>
          </div>

          <div class="form-group">
            <label for="location">Location</label>
            <input 
              type="text" 
              id="location" 
              [(ngModel)]="formData.location" 
              name="location"
              placeholder="Enter location"
            >
          </div>

          <div class="form-group">
            <label for="color">Color</label>
            <div class="color-picker">
              <div 
                *ngFor="let color of availableColors"
                class="color-option"
                [style.background-color]="color"
                [class.selected]="formData.color === color"
                (click)="selectColor(color)"
              ></div>
            </div>
          </div>

          <div class="form-group">
            <label for="attendees">Attendees</label>
            <div class="attendees-input">
              <input 
                type="email" 
                [(ngModel)]="newAttendee" 
                name="newAttendee"
                placeholder="Enter email address"
                (keyup.enter)="addAttendee()"
              >
              <button type="button" (click)="addAttendee()" class="add-attendee-btn">Add</button>
            </div>
            <div class="attendees-list" *ngIf="formData.attendees.length > 0">
              <div 
                *ngFor="let attendee of formData.attendees; let i = index"
                class="attendee-tag"
              >
                <span>{{ attendee }}</span>
                <button type="button" (click)="removeAttendee(i)" class="remove-attendee">×</button>
              </div>
            </div>
          </div>

          <div class="conflict-warning" *ngIf="hasConflict">
            ⚠️ This appointment conflicts with existing appointments
          </div>

          <div class="form-actions">
            <button type="button" (click)="closeModal()" class="cancel-btn">Cancel</button>
            <button type="button" (click)="deleteAppointment()" *ngIf="editingAppointment" class="delete-btn">Delete</button>
            <button type="submit" class="save-btn" [disabled]="!isFormValid()">
              {{ editingAppointment ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 0;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    .appointment-form {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #374151;
      font-size: 14px;
    }

    input[type="text"],
    input[type="email"],
    input[type="date"],
    input[type="time"],
    textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 400;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
    }

    .color-picker {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .color-option {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.2s ease;
    }

    .color-option:hover {
      transform: scale(1.1);
    }

    .color-option.selected {
      border-color: #374151;
      transform: scale(1.1);
    }

    .attendees-input {
      display: flex;
      gap: 8px;
    }

    .attendees-input input {
      flex: 1;
    }

    .add-attendee-btn {
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s ease;
    }

    .add-attendee-btn:hover {
      background-color: #2563eb;
    }

    .attendees-list {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .attendee-tag {
      display: flex;
      align-items: center;
      background-color: #f3f4f6;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 12px;
      color: #374151;
    }

    .remove-attendee {
      background: none;
      border: none;
      margin-left: 6px;
      cursor: pointer;
      color: #6b7280;
      font-size: 14px;
    }

    .conflict-warning {
      background-color: #fef3cd;
      color: #d97706;
      padding: 12px;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .cancel-btn,
    .delete-btn,
    .save-btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cancel-btn {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .cancel-btn:hover {
      background-color: #f9fafb;
    }

    .delete-btn {
      background: #dc2626;
      color: white;
      border: none;
    }

    .delete-btn:hover {
      background-color: #b91c1c;
    }

    .save-btn {
      background: #3b82f6;
      color: white;
      border: none;
    }

    .save-btn:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .save-btn:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .modal-content {
        width: 95%;
      }
    }
  `]
})
export class AppointmentModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() editingAppointment?: Appointment;
  @Input() selectedDate?: Date;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Appointment>();
  @Output() delete = new EventEmitter<string>();

  formData: any = {
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    color: '#3b82f6',
    isAllDay: false,
    attendees: []
  };

  newAttendee = '';
  hasConflict = false;

  availableColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit() {
    this.resetForm();
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.resetForm();
    }
  }

  resetForm() {
    if (this.editingAppointment) {
      this.formData = {
        title: this.editingAppointment.title,
        description: this.editingAppointment.description,
        startDate: this.formatDateForInput(this.editingAppointment.startTime),
        startTime: this.formatTimeForInput(this.editingAppointment.startTime),
        endDate: this.formatDateForInput(this.editingAppointment.endTime),
        endTime: this.formatTimeForInput(this.editingAppointment.endTime),
        location: this.editingAppointment.location || '',
        color: this.editingAppointment.color,
        isAllDay: this.editingAppointment.isAllDay,
        attendees: [...this.editingAppointment.attendees]
      };
    } else {
      const defaultDate = this.selectedDate || new Date();
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1, 0, 0, 0);

      this.formData = {
        title: '',
        description: '',
        startDate: this.formatDateForInput(defaultDate),
        startTime: this.formatTimeForInput(defaultTime),
        endDate: this.formatDateForInput(defaultDate),
        endTime: this.formatTimeForInput(new Date(defaultTime.getTime() + 60 * 60 * 1000)),
        location: '',
        color: '#3b82f6',
        isAllDay: false,
        attendees: []
      };
    }
    this.checkConflict();
  }

  closeModal() {
    this.close.emit();
  }

  saveAppointment() {
    if (!this.isFormValid()) return;

    const startTime = this.formData.isAllDay 
      ? new Date(this.formData.startDate + 'T00:00:00')
      : new Date(this.formData.startDate + 'T' + this.formData.startTime);

    const endTime = this.formData.isAllDay
      ? new Date(this.formData.endDate + 'T23:59:59')
      : new Date(this.formData.endDate + 'T' + this.formData.endTime);

    const appointment: Appointment = {
      id: this.editingAppointment?.id || this.generateId(),
      title: this.formData.title,
      description: this.formData.description,
      startTime,
      endTime,
      location: this.formData.location,
      color: this.formData.color,
      isAllDay: this.formData.isAllDay,
      attendees: this.formData.attendees,
      createdBy: 'user@example.com'
    };

    this.save.emit(appointment);
  }

  deleteAppointment() {
    if (this.editingAppointment) {
      this.delete.emit(this.editingAppointment.id);
    }
  }

  onAllDayChange() {
    if (this.formData.isAllDay) {
      this.formData.startTime = '';
      this.formData.endTime = '';
    } else {
      this.formData.startTime = '09:00';
      this.formData.endTime = '10:00';
    }
    this.checkConflict();
  }

  selectColor(color: string) {
    this.formData.color = color;
  }

  addAttendee() {
    if (this.newAttendee && this.isValidEmail(this.newAttendee)) {
      if (!this.formData.attendees.includes(this.newAttendee)) {
        this.formData.attendees.push(this.newAttendee);
        this.newAttendee = '';
      }
    }
  }

  removeAttendee(index: number) {
    this.formData.attendees.splice(index, 1);
  }

  checkConflict() {
    if (!this.formData.startDate || !this.formData.endDate) {
      this.hasConflict = false;
      return;
    }

    const startTime = this.formData.isAllDay 
      ? new Date(this.formData.startDate + 'T00:00:00')
      : new Date(this.formData.startDate + 'T' + (this.formData.startTime || '00:00'));

    const endTime = this.formData.isAllDay
      ? new Date(this.formData.endDate + 'T23:59:59')
      : new Date(this.formData.endDate + 'T' + (this.formData.endTime || '23:59'));

    this.hasConflict = this.appointmentService.checkTimeConflict(
      startTime, 
      endTime, 
      this.editingAppointment?.id
    );
  }

  isFormValid(): boolean {
    return !!(
      this.formData.title &&
      this.formData.startDate &&
      this.formData.endDate &&
      (this.formData.isAllDay || (this.formData.startTime && this.formData.endTime))
    );
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTimeForInput(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}