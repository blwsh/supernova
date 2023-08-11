type TimelineEvent = {
    title: string,
    description: string,
    tooltip?: string,
    link?: string,
    start: Date,
    end: Date,
    color: string,
    height?: string,
    expiring?: boolean,
}
