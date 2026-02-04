import axios from "axios";

export const publishTradesApi = async (activeTimeSlots: any[]) => {
  const payload = {
    trades: activeTimeSlots.map(slot => {
      const { startTime, endTime } = splitTimeRange(slot.time);

      return {
        startTime,
        endTime,
        price: slot.rate,
        kWh: slot.kWh,
      };
    }),
    date: new Date().toISOString().split("T")[0],
    source: "prepared_tomorrow_screen",
  };
  console.log("Publishing trades with payload:", payload);  

  return axios.post("http://localhost:3000/api/create", payload);
};

// helper
const splitTimeRange = (time: string) => {
  const [start, end] = time.split("–").map(t => t.trim());
  const date = new Date(); // or tomorrow's date

  return {
    startTime: toISOTime(date, start),
    endTime: toISOTime(date, end),
  };
};

// helper to convert "10:00 AM" → ISO
const toISOTime = (date: Date, timeStr: string) => {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const dt = new Date(date);
  dt.setHours(hours, minutes, 0, 0);

  return dt.toISOString(); // returns "2026-01-28T06:00:00Z"
};

