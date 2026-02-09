export const normalizeDate = (date: string | Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const parseDateLocal = (dateInput?: string | null): Date => {
  if (!dateInput) return new Date();
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getFiscalInfo = (date: Date) => {
  const month = date.getMonth();
  const fy = month < 3 ? date.getFullYear() - 1 : date.getFullYear();
  return { fy, label: `${fy}年度` };
};

export const getISOWeek = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const getJapaneseHolidays = (year: number): Record<string, string> => {
  const holidays: Record<string, string> = {};
  const add = (date: Date, name: string) => { holidays[formatDate(date)] = name; };
  add(new Date(year, 0, 1), "元日");
  add(new Date(year, 1, 11), "建国記念の日");
  add(new Date(year, 1, 23), "天皇誕生日");
  add(new Date(year, 3, 29), "昭和の日");
  add(new Date(year, 4, 3), "憲法記念日");
  add(new Date(year, 4, 4), "みどりの日");
  add(new Date(year, 4, 5), "こどもの日");
  add(new Date(year, 7, 11), "山の日");
  add(new Date(year, 10, 3), "文化の日");
  add(new Date(year, 10, 23), "勤労感謝の日");
  const getHappyMonday = (month: number, week: number) => {
    const first = new Date(year, month, 1);
    const day = first.getDay();
    const offset = (1 - day + 7) % 7;
    return new Date(year, month, 1 + offset + (week - 1) * 7);
  };
  add(getHappyMonday(0, 2), "成人の日");
  add(getHappyMonday(6, 3), "海の日");
  add(getHappyMonday(8, 3), "敬老の日");
  add(getHappyMonday(9, 2), "スポーツの日");
  const shunbun = Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  add(new Date(year, 2, shunbun), "春分の日");
  const shubun = Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  add(new Date(year, 8, shubun), "秋分の日");
  Object.keys(holidays).forEach(dateStr => {
    const d = new Date(dateStr);
    if (d.getDay() === 0) {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      while (holidays[formatDate(next)]) next.setDate(next.getDate() + 1);
      add(next, "振替休日");
    }
  });
  const sortedDates = Object.keys(holidays).sort();
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const d1 = new Date(sortedDates[i]!);
    const d2 = new Date(sortedDates[i + 1]!);
    const diff = (d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000);
    if (diff === 2) {
      const mid = new Date(d1);
      mid.setDate(mid.getDate() + 1);
      if (mid.getDay() !== 0) add(mid, "国民の休日");
    }
  }
  return holidays;
};
