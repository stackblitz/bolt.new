import type { ChatHistory } from '~/lib/persistence';
import { format, isToday, isYesterday, isThisWeek, isThisYear, subDays, isAfter } from 'date-fns';

type Bin = { category: string; items: ChatHistory[] };

export function binDates(_list: ChatHistory[]) {
  const list = _list.toSorted((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  const binLookup: Record<string, Bin> = {};
  const bins: Array<Bin> = [];

  list.forEach((item) => {
    const category = dateCategory(new Date(item.timestamp));

    if (!(category in binLookup)) {
      const bin = {
        category,
        items: [item],
      };

      binLookup[category] = bin;
      bins.push(bin);
    } else {
      binLookup[category].items.push(item);
    }
  });

  return bins;
}

function dateCategory(date: Date) {
  if (isToday(date)) {
    return 'Today';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  if (isThisWeek(date)) {
    return format(date, 'eeee'); // e.g. "Monday"
  }

  const thirtyDaysAgo = subDays(new Date(), 30);

  if (isAfter(date, thirtyDaysAgo)) {
    return 'Last 30 Days';
  }

  if (isThisYear(date)) {
    return format(date, 'MMMM'); // e.g., "July"
  }

  return format(date, 'MMMM yyyy'); // e.g. "July 2023"
}
