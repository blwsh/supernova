import React from "react";

export const Tags: React.FC<{
    tags: string[],
    selected: string[],
    onSelect?: (tag: string) => void
    onDeselect?: (tag: string) => void
}> = ({
          tags,
          selected,
          onSelect = () => {},
          onDeselect = () => {}
      }) => {
    return <div className='tags'>
        {tags.map(tag => <Tag
            key={tag}
            tag={tag}
            selected={selected.includes(tag)}
            onSelect={onSelect}
            onDeselect={onDeselect}
        />)}
    </div>
}

const Tag: React.FC<{
    tag: string,
    selected: boolean,
    onSelect: (tag: string) => void,
    onDeselect: (tag: string) => void
}> = ({tag, selected, onSelect, onDeselect}) => {
    return <div
        onClick={() => selected ? onDeselect(tag) : onSelect(tag)}
        className={`tag ${selected ? 'tag-selected' : ''}`}
    >
        {tag}
    </div>
}
