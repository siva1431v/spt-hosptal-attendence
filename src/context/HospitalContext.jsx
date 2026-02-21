import React, { createContext, useContext, useState, useEffect } from 'react';

const HospitalContext = createContext();

export const useHospitalContext = () => useContext(HospitalContext);

export const HospitalProvider = ({ children }) => {
  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('hospital_staff');
    return saved ? JSON.parse(saved) : [];
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('hospital_attendance');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('hospital_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('hospital_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const addStaff = (employee) => {
    setStaff([...staff, { ...employee, id: Date.now().toString() }]);
  };

  const updateStaff = (id, updatedData) => {
    setStaff(staff.map(emp => emp.id === id ? { ...emp, ...updatedData } : emp));
  };

  const removeStaff = (id) => {
    setStaff(staff.filter(emp => emp.id !== id));
    // Optionally clean up attendance if needed, but not strictly necessary for simple version
  };

  // monthKey format: 'YYYY-MM'
  const saveAttendance = (monthKey, records) => {
    setAttendance(prev => ({ ...prev, [monthKey]: records }));
  };

  const getAttendanceForMonth = (monthKey) => {
    return attendance[monthKey] || {};
  };

  return (
    <HospitalContext.Provider value={{
      staff,
      addStaff,
      updateStaff,
      removeStaff,
      attendance,
      saveAttendance,
      getAttendanceForMonth
    }}>
      {children}
    </HospitalContext.Provider>
  );
};
