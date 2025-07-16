import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CalendarComponent } from './components/calendar/calendar.component';
import { AppointmentModalComponent } from './components/appointment-modal/appointment-modal.component';
import { AppointmentService } from './services/appointment.service';
import { Appointment } from './models/appointment.interface';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <span class="calendar-icon">📅</span>
            Calendar
          </h1>
          <div class="header-actions">
            <button (click)="openCreateModal()" class="create-appointment-btn">
              <span class="plus-icon">+</span>
              New Appointment
            </button>
          </div>
        </div>
      </header>

      <main class="app-main">
        <app-calendar #calendar></app-calendar>
      </main>

      <app-appointment-modal
        [isOpen]="isModalOpen"
        [editingAppointment]="editingAppointment"
        [selectedDate]="selectedDate"
        (close)="closeModal()"
        (save)="saveAppointment($event)"
        (delete)="deleteAppointment($event)"
      ></app-appointment-modal>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .app-header {
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-bottom: 1px solid #e5e7eb;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .app-title {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .calendar-icon {
      font-size: 28px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .create-appointment-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    }

    .create-appointment-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }

    .plus-icon {
      font-size: 18px;
      font-weight: 400;
    }

    .app-main {
      padding: 20px 0;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .app-title {
        font-size: 20px;
      }

      .create-appointment-btn {
        padding: 10px 20px;
        font-size: 13px;
      }
    }
  `],
  imports: [CalendarComponent, AppointmentModalComponent]
})
export class App {
  isModalOpen = false;
  editingAppointment?: Appointment;
  selectedDate?: Date;

  constructor(private appointmentService: AppointmentService) {}

  openCreateModal(date?: Date) {
    this.selectedDate = date || new Date();
    this.editingAppointment = undefined;
    this.isModalOpen = true;
  }

  openEditModal(appointment: Appointment) {
    this.editingAppointment = appointment;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingAppointment = undefined;
    this.selectedDate = undefined;
  }

  saveAppointment(appointment: Appointment) {
    if (this.editingAppointment) {
      this.appointmentService.updateAppointment(appointment);
    } else {
      this.appointmentService.addAppointment(appointment);
    }
    this.closeModal();
  }

  deleteAppointment(id: string) {
    this.appointmentService.deleteAppointment(id);
    this.closeModal();
  }
}

bootstrapApplication(App, {
  providers: [AppointmentService]
});