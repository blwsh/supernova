import React, {useCallback, useEffect, useState} from 'react';
import './App.css';
import {Timeline} from "./components/Timeline";
import {Tags} from "./components/Tags";
import {ProductColorMap} from "./productColorMap";
import {useSearchParams} from "react-router-dom";

type EndoflifeDateProductResponse = {
    cycle: string
    lts: string
    releaseDate: string
    support: string
    eol: string | boolean
    latestReleaseDate: string
    link: string
}

function App() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [limit, setLimit] = useState<number>(10)
    const [tags, setTags] = useState<string[]>([])
    const [filteredTags, setFilteredTags] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [events, setEvents] = useState<TimelineEvent[]>([])
    const [search, setSearch] = useState<string>('')
    const [hideControls] = useState<boolean>(searchParams.get('hideControls') === 'true')

    useEffect(() => {
        fetch('https://endoflife.date/api/all.json')
            .then(response => response.json())
            .then(products => {
                setTags(Object.values(products))
                setFilteredTags(Object.values(products))
            })
            .catch(console.error)
    }, [])

    const selectProduct = useCallback((product: string) => {
        const newSelectedTags = [...selectedTags, product];
        setSelectedTags(newSelectedTags)
        setSearchParams({products: newSelectedTags.join(',')})

        fetch(`https://endoflife.date/api/${product}.json`)
            .then<EndoflifeDateProductResponse[]>(response => response.json())
            .then(response => {
                const newEvents: TimelineEvent[] = [];

                response.forEach(event => {
                    ['support', 'eol'].forEach(type => {
                        const typeString = type as 'eol' | 'support'
                        const end = typeof event[typeString] == 'string' ? new Date(event[typeString] as string) : new Date(event.latestReleaseDate)

                        newEvents.push({
                            title: `${event.cycle} ${event.lts ? '(LTS)' : ''} ${type}`,
                            description: `${event.releaseDate} - ${end}`,
                            link: event.link,
                            tooltip: product,
                            start: new Date(event.releaseDate),
                            end: end,
                            color: ProductColorMap[product],
                            height: '40px',
                            expiring: event.eol !== false
                        })
                    })
                })

                setEvents([...events, ...newEvents])
            })
            .catch(console.error)
    }, [events, selectedTags, setSearchParams])

    const deselectProduct = useCallback((product: string) => {
        setSelectedTags(selectedTags.filter(t => t !== product))
        setSearchParams({products: selectedTags.join(',')})
        setEvents(events.filter(e => e.color !== ProductColorMap[product]))
    }, [events, selectedTags, setSearchParams])

    const onSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setFilteredTags([
            ...selectedTags,
            ...tags.filter(product => product.includes(search))])
    }, [search, tags, selectedTags])

    return (
        <div className="box">
            {!hideControls && (<div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <input onChange={onSearch} value={search} placeholder="Search"/>
                    <input type="number" value={limit} onChange={e => setLimit(parseInt(e.target.value))} placeholder="Limit"/>
                </div>
                <Tags
                    tags={filteredTags}
                    selected={selectedTags}
                    onSelect={selectProduct}
                    onDeselect={deselectProduct}
                />
            </div>)}
            <div className="container">
                <Timeline events={events} limit={limit}/>
            </div>
        </div>
    );
}

export default App;
