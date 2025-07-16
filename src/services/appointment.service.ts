import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appointment } from '../models/appointment.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  constructor() {
    // Sample data
    const sampleAppointments: Appointment[] = [
      {
        id: '1',
        title: 'Team Meeting',
        description: 'Weekly team sync',
        startTime: new Date(2025, 0, 15, 10, 0),
        endTime: new Date(2025, 0, 15, 11, 0),
        attendees: ['john@example.com', 'jane@example.com'],
        location: 'Conference Room A',
        color: '#3b82f6',
        isAllDay: false,
        createdBy: 'user@example.com'
      },
      {
        id: '2',
        title: 'Project Review',
        description: 'Monthly project review',
        startTime: new Date(2025, 0, 16, 14, 0),
        endTime: new Date(2025, 0, 16, 15, 30),
        attendees: ['manager@example.com'],
        color: '#10b981',
        isAllDay: false,
        createdBy: 'user@example.com'
      },
      {
        id: '3',
        title: 'Conference',
        description: 'Annual tech conference',
        startTime: new Date(2025, 0, 20, 0, 0),
        endTime: new Date(2025, 0, 20, 23, 59),
        attendees: [],
        color: '#f59e0b',
        isAllDay: true,
        createdBy: 'user@example.com'
      }
    ];
    
    this.appointmentsSubject.next(sampleAppointments);
  }

  getAppointments(): Observable<Appointment[]> {
    return this.appointments$;
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    const appointments = this.appointmentsSubject.value;
    return appointments.filter(appointment => 
      this.isSameDay(appointment.startTime, date)
    );
  }

  getAppointmentsForDateRange(startDate: Date, endDate: Date): Appointment[] {
    const appointments = this.appointmentsSubject.value;
    return appointments.filter(appointment => 
      appointment.startTime >= startDate && appointment.startTime <= endDate
    );
  }

  addAppointment(appointment: Appointment): void {
    const appointments = this.appointmentsSubject.value;
    appointments.push(appointment);
    this.appointmentsSubject.next([...appointments]);
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const appointments = this.appointmentsSubject.value;
    const index = appointments.findIndex(app => app.id === updatedAppointment.id);
    if (index !== -1) {
      appointments[index] = updatedAppointment;
      this.appointmentsSubject.next([...appointments]);
    }
  }

  deleteAppointment(id: string): void {
    const appointments = this.appointmentsSubject.value;
    const filteredAppointments = appointments.filter(app => app.id !== id);
    this.appointmentsSubject.next(filteredAppointments);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  checkTimeConflict(startTime: Date, endTime: Date, excludeId?: string): boolean {
    const appointments = this.appointmentsSubject.value;
    return appointments.some(appointment => {
      if (excludeId && appointment.id === excludeId) return false;
      if (appointment.isAllDay) return false;
      
      return (startTime < appointment.endTime && endTime > appointment.startTime);
    });
  }
}