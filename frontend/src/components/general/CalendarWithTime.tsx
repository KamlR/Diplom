import React, { useState } from 'react'
import DatePicker from 'react-datepicker'

const CalendarWithTime: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [startDate, setStartDate] = useState(new Date())

  return (
    <div style={{ display: 'inline-block', margin: '0 auto' }}>
      <DatePicker selected={selectedDate} onChange={date => setSelectedDate(date)} />
    </div>
  )
}

export default CalendarWithTime
