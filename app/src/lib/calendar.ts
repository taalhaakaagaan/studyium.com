
export const generateGoogleCalendarUrl = (event: {
    title: string;
    description?: string;
    location?: string;
    startTime: Date; // Start Date object
    endTime?: Date;   // End Date object (defaults to +1 hour)
}) => {
    const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const start = formatTime(event.startTime);
    let end = "";

    if (event.endTime) {
        end = formatTime(event.endTime);
    } else {
        const endDate = new Date(event.startTime);
        endDate.setHours(endDate.getHours() + 1);
        end = formatTime(endDate);
    }

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${start}/${end}`,
        details: event.description || "",
        location: event.location || "Studyium Live Class"
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
