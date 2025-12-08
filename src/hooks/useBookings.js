import { useState, useEffect, useCallback } from 'react';
import { format, parseISO, startOfDay, isSameDay } from 'date-fns';
import managePlaceTable from '../api/managePlaceTable';

/**
 * Unified hook for fetching and merging customer and guest bookings
 * @param {Date|null} date - The date to fetch bookings for (null = all bookings)
 * @returns {Object} { bookings, loading, error, refetch }
 */
export function useBookings(date = null) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!date) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Normalize date to start of day in local timezone (no timezone shift)
      const normalizedDate = startOfDay(date);
      const dateStr = format(normalizedDate, 'yyyy-MM-dd');
      const startDate = `${dateStr}T00:00:00`;
      const endDate = `${dateStr}T23:59:59`;

      // Fetch both customer and guest bookings
      const [customerBookings, guestBookings] = await Promise.all([
        managePlaceTable.getCustomerBookingsByDateRange(startDate, endDate).catch(() => []),
        managePlaceTable.getGuestBookingsByDateRange(startDate, endDate).catch(() => [])
      ]);

      // Normalize and merge bookings, filtering by exact date match
      const allBookings = [
        ...(Array.isArray(customerBookings) ? customerBookings : []),
        ...(Array.isArray(guestBookings) ? guestBookings : [])
      ];

      // Filter bookings that match the exact date (using date-fns isSameDay)
      const normalizedBookings = allBookings
        .map((booking) => {
          if (!booking.startedAt) return null;

          // Parse ISO string and compare dates
          let bookingDate;
          try {
            bookingDate = parseISO(booking.startedAt);
          } catch {
            return null;
          }

          // Check if booking date matches target date (same day, ignoring time)
          if (!isSameDay(bookingDate, normalizedDate)) {
            return null;
          }

          return {
            id: booking.id,
            type: booking.user ? 'customer' : 'guest',
            name: booking.user?.fullname || booking.fullname || '-',
            phoneNumber: booking.phoneNumber || '-',
            email: booking.user?.email || booking.email || null,
            startedAt: booking.startedAt,
            member: booking.member || booking.memberInt || 0,
            status: booking.status,
            note: booking.note || null,
            original: booking
          };
        })
        .filter(Boolean);

      // Sort by time
      normalizedBookings.sort((a, b) => {
        try {
          const timeA = parseISO(a.startedAt).getTime();
          const timeB = parseISO(b.startedAt).getTime();
          return timeA - timeB;
        } catch {
          return 0;
        }
      });

      setBookings(normalizedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings
  };
}

/**
 * Hook for fetching bookings for a date range (for calendar month view)
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Object} { bookingsByDate, loading, error, refetch }
 */
export function useBookingsByDateRange(startDate, endDate) {
  const [bookingsByDate, setBookingsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Normalize dates to start of day in local timezone (no timezone shift)
      const normalizedStart = startOfDay(startDate);
      const normalizedEnd = startOfDay(endDate);
      const startStr = format(normalizedStart, 'yyyy-MM-dd');
      const endStr = format(normalizedEnd, 'yyyy-MM-dd');
      const startDateTime = `${startStr}T00:00:00`;
      const endDateTime = `${endStr}T23:59:59`;

      // Fetch both customer and guest bookings
      const [customerBookings, guestBookings] = await Promise.all([
        managePlaceTable.getCustomerBookingsByDateRange(startDateTime, endDateTime).catch(() => []),
        managePlaceTable.getGuestBookingsByDateRange(startDateTime, endDateTime).catch(() => [])
      ]);

      // Group bookings by date using date-fns for consistent date handling
      const grouped = {};

      const processBookings = (bookingList) => {
        (Array.isArray(bookingList) ? bookingList : []).forEach((booking) => {
          if (!booking.startedAt) return;

          // Parse ISO string and format to YYYY-MM-DD (no timezone shift)
          let bookingDate;
          try {
            bookingDate = parseISO(booking.startedAt);
          } catch {
            return;
          }

          // Format to YYYY-MM-DD string (local date, no timezone conversion)
          const dateStr = format(startOfDay(bookingDate), 'yyyy-MM-dd');

          if (!grouped[dateStr]) {
            grouped[dateStr] = {
              total: 0,
              pending: 0,
              confirmed: 0,
              completed: 0,
              denied: 0,
              bookings: []
            };
          }

          // Normalize booking object
          const normalizedBooking = {
            id: booking.id,
            type: booking.user ? 'customer' : 'guest',
            name: booking.user?.fullname || booking.fullname || '-',
            phoneNumber: booking.phoneNumber || '-',
            email: booking.user?.email || booking.email || null,
            startedAt: booking.startedAt,
            member: booking.member || booking.memberInt || 0,
            status: booking.status,
            note: booking.note || null,
            original: booking
          };

          grouped[dateStr].bookings.push(normalizedBooking);
          grouped[dateStr].total += 1;
          const status = (booking.status || '').toUpperCase();
          if (grouped[dateStr][status.toLowerCase()] !== undefined) {
            grouped[dateStr][status.toLowerCase()] += 1;
          }
        });
      };

      processBookings(customerBookings);
      processBookings(guestBookings);

      setBookingsByDate(grouped);
    } catch (err) {
      console.error('Error fetching bookings by date range:', err);
      setError(err.message || 'Failed to fetch bookings');
      setBookingsByDate({});
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookingsByDate,
    loading,
    error,
    refetch: fetchBookings
  };
}
