type FormateDateProps = {
  dateStr: string;
  style?: string;
};

export const formatDate = (obj: FormateDateProps) => {
  const locale = navigator.language;
  const mediumDateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  });
  const longDateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "long" });

  const { dateStr, style = "medium" } = obj;

  const date = new Date(dateStr);
  return style === "long"
    ? longDateFormat.format(date)
    : mediumDateFormat.format(date);
};
