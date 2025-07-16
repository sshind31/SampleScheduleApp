export interface Appointment {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  color: string;
  isAllDay: boolean;
  createdBy: string;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  isReserved: boolean;
  appointment?: Appointment;
}

export interface CalendarDay {
  date: Date;
  appointments: Appointment[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}