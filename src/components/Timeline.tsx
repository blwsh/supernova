import React, {useEffect, useRef} from "react";

export const Timeline: React.FC<{
    events: TimelineEvent[],
    defaultHeight?: string,
    expiring?: boolean,
    limit?: number
}> = ({
          events = [],
          defaultHeight = '50px',
          expiring = false,
          limit = 8
      }
) => {
    const container = useRef(null)

    useEffect(() => {
        const element = container?.current;

        if (!element) return;

        const observer = new ResizeObserver(() => {
            console.log('resize')
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, [container])

    events = events.sort((a, b) => a.start.getTime() - b.start.getTime());

    // set default height if not provided
    events = events.map(event => {
        if (!event.height) event.height = defaultHeight;
        return event;
    })

    // limit rendering to most recent n events where n is the limit
    events = events.slice(Math.max(events.length - limit, 0), events.length)

    const earliest = events.length ? events.reduce((prev, curr) => prev.start < curr.start ? prev : curr) : undefined
    const latest = events.length ? events.reduce((prev, curr) => curr.end > prev.end ? curr : prev) : undefined;


    if (!earliest || !latest) return <div className='timeline'>Select a product to view the timeline for</div>

    return <div className='timeline' ref={container}>
        <div className='timeline-current-marker' style={{
            left: `${(new Date().getTime() - earliest.start.getTime()) / (latest.end.getTime() - earliest.start.getTime()) * 100}%`
        }}></div>

        {events.map((event, index) => {
            const start = event.start.getTime() - earliest.start.getTime();
            const end = event.end.getTime() - earliest.start.getTime();

            const width = (end - start) / (latest.end.getTime() - earliest.start.getTime()) * 100;

            return <a key={index}
                      href={event.link} target={`_blank`} rel="noreferrer" title={event.tooltip}
                      className='timeline-event'
                      style={{
                          left: `${start / (latest.end.getTime() - earliest.start.getTime()) * 100}%`,
                          width: `${width}%`,
                          background: event.color,
                          height: event.height,
                          borderRadius: `${parseInt(event.height!) / 4}px`,
                          padding: `0px ${parseInt(event.height!) / 4.5}px`,
                          margin: `${parseInt(event.height!) / 4.5}px 0`,
                          fontSize: `${parseInt(event.height!) / 3}px`,
                          border: expiring  ? '1px solid #e86868' : 'none'
                      }}>
                <div className='timeline-event-title'>{event.title}</div>
                <div className='timeline-event-description'>{event.description}</div>
            </a>
        })}
    </div>
}
